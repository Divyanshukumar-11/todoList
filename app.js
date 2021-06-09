const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

let workList = [];

app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static("public"));

app.set("view engine" , "ejs");

mongoose.connect("mongodb+srv://admin-divyanshu:Test123@cluster0.md9yt.mongodb.net/todoListDB" , {useNewUrlParser : true})

const itemSchema = new mongoose.Schema({
    name : String
})

const Items = mongoose.model("Items" , itemSchema);

const listSchema = {
    name : String,
    items : [itemSchema]
};

const List = mongoose.model("List" , listSchema);

const item1 = new Items({
    name : "Welcome to to-do List"
})

const item2 = new Items({
    name : "Hit the + button to add new item"
})

const item3 = new Items({
    name : "<-- Hit this to delete the item"
})

const defaultItem = [item1 ,item2 ,item3];


app.get("/" , function(req , res){

    Items.find({} , function(err , foundItems){

            if(foundItems.length===0){
                Items.insertMany(defaultItem , function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("feeded successfully");
                    }
                })
                res.redirect("/")
            }
            else{
                res.render("list" , {listTitle: "Today", newListItem:foundItems});
            }
    })

   
});

app.post("/" , function(req , res){
    const itemName = req.body.nameofItem;
    const listName = req.body.list;
    
    const item = new Items({
        name : itemName
    })

    if(listName==="Today"){
        item.save();

        res.redirect("/");
    }
    else{
        List.findOne({name : listName} , function(err , foundList){
            foundList.items.push(item);
            foundList.save()
            res.redirect("/"+listName)
        })
    }
    
})

app.post("/delete" ,function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Items.deleteOne({_id : checkedItemId} , function(err){
            if(err){
                console.log(err)
            }
            else{
                console.log("successfully deleted");
                res.redirect("/")
            }
        })
    }

    else{
        List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : checkedItemId }}}, function(err , foundList){
            if(!err){
                res.redirect("/" + listName)
            }
        })
        console.log(listName)
    }
})

app.get("/:customListName" , function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName} , function(err , foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name : customListName,
                    items : defaultItem
                });
            
                list.save(() => res.redirect('/' + customListName));
            }
            else{
                res.render("list" , {listTitle:foundList.name , newListItem:foundList.items});
            }
        }
    })

    

    
})

app.get("/about" , function(req , res){
    res.render("about");
})

let port= process.env.PORT;
if(port== null || port=="")
{
    port=3000;
}

app.listen(port , function(){
    console.log("server is running");
})