//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://ryan:123@cluster0.tmz87.mongodb.net/todolistDB", {useNewUrlParser: true});


const itemSchema = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("Item", itemSchema)

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})






const List = mongoose.model("List", listSchema); 
const item1 = new Item({
  name: "default1"
})

const item2 = new Item({
  name: "default2"
})

const item3 = new Item({
  name: "default3"
})



const defaultItems= [item1, item2, item3];


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName }, function(err, foundList){
    if (!err){
      if(!foundList){
        
        const list = new List({
          name: customListName,
          items: defaultItems
        });
  list.save()
  res.redirect("/" + customListName);
     }else{
       console.log("exists")
       res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
     }
    }
  });
    
  
  // const list = new List({
  //   name: customListName,
  //   items: defaultItems
  // })
  
  
  // const listSchema = {
  //   name: String,
  //   items: [itemsSchema]
  // }
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });
  item.save()
  res.redirect("/")
})

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }else{
          console.log("entered successfully")
        }
      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
  
  

  
  
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port ==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
