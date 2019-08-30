//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ioan:Wolfenstein10@cluster0-kn4kz.mongodb.net/todolistDB", {useNewUrlParser:true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Walk the Dog"
});

const item2 = new Item ({
  name: "Water the flowers"
});

const item3 = new Item ({
  name: "Go to work"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};


const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {




  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Default items succesfully added");
        }
      });
      
       res.redirect('/');

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
    });
  }



});


app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;


  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item with the id of " + checkedItemID + " deleted");
        res.redirect("/");
      }
  });

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }

    });


  }


});

app.get("/:listRoute", function(req, res){
  const customListName = _.capitalize(req.params.listRoute);


  List.findOne({name: customListName}, function(err, result){
    if(!err){
      if(!result){
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
      });
      
      list.save();
     res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
});


});





app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started succesfully");
});
