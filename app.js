const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-asr:Admin@123@cluster0.sbpka.mongodb.net/?retryWrites=true&w=majority/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todolist!"
}); 

const item2 = new Item({
  name: "Hit + button to add a new item."
}); 

const item3 = new Item({
  name: "<-- Hit this item to delete an item."
}); 

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List =mongoose.model("List",listSchema)


app.get("/", function (req,res) {

  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items into DB!")
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
  
});

app.post("/", function (req,res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName=="Today"){
    Item.findOneAndDelete(checkItemID,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item removed successfully!");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkItemID}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }else{
        console.log(err);
      }
    });
  }
  
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err, foundList){
      if(!err){
        if(!foundList){
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }else{
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });
      
});

app.get("/about",function(req,res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port ==""){
  port = 2000;
}

app.listen(port, function () {
  console.log("Server running on 2000");
});
