let mongodb = require('mongodb');
let MongodbClient = mongodb.MongoClient;
let express = require('express');
let bodyParser = require('body-parser');
let ejs = require('ejs');
let url = 'mongodb://localhost:27017/';

let db;
let col=null;

let app = express();    //configure express


app.engine('html', ejs.renderFile);
app.set('view engine','html');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('css'))
app.use(express.static('images'))

MongodbClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err,client){
    if(err){
        console.log('Err',err);
    }else{
        console.log('Connected to server');
        db = client.db('w6lab');
        col = db.collection('taskToDo');
    }


})

app.get('/', function(req,res){
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/addNewTask',function(req,res){
    res.sendFile(__dirname +"/views/addNewTask.html");
});

app.post('/addNewTask', function(req,res){  //recieve object from client and add new task to collection
    let taskDetails = req.body
    let theID = getNewRandomID();
    col.insertOne({
        taskID:theID, 
        taskName: taskDetails.taskName,
        taskPerson: taskDetails.taskPerson,
        taskDueDate: taskDetails.taskDueDate,
        taskStatus: taskDetails.taskStatus,
        taskDesc: taskDetails.taskDesc
    });
    res.redirect('/allTask');
});

app.get('/allTask', function(req,res){      //show all tasks in page in collection to client
    let query = {};
    col.find(query).toArray(function(err,data){
        //res.sendFile(__dirname+'/views/listTask.html',{tasks:data});
        if (err){
            res.redirect('/404');
        }else{
            res.render('listTask.html',{col: data})
        }
    });
});

app.get('/deleteAllTask', function(req,res){    //delete task send page to client
    res.sendFile(__dirname+'/views/deleteAllTask.html');

});
app.post('/deleteAllTask', function(req,res){   //delete all completed tasks
    let query ={taskStatus:{$eq:"Complete"}};
    col.deleteMany(query,function(err,obj){
        console.log(obj.result);
    });
    res.redirect('/allTask');
});

app.get('/deleteTaskID', function(req,res){
    res.sendFile(__dirname + "/views/deleteTaskID.html");
})

app.post('/deleteTaskID', function(req,res){
    let query ={task_ID:req.body.taskID};
    col.deleteOne(query,function(err,obj){
        console.log(obj.result);
    });
    res.redirect('/alltask');

});

app.get('/updateTask',function(req,res){
    res.sendFile(__dirname + '/views/updateTask.html');
});

app.post('/updateTaskStat',function(req,res){
    let taskDetails = req.body;
    let filter = {taskID: taskDetails.taskID};
    let taskUpdate = {$set:{tasks:taskDetails.taskNewStat}};


    col.updateOne(filter,taskUpdate, {upsert:true},function(err,result){});
    res.redirect('/allTask');
});


app.get('/findNotTomorrow',function(req,res){
    res.sendFile(__dirname+"/views/findDate.html");

});

app.post('/findDate',function(req,res){
    let taskDate = req.body.taskDate;
    let query ={taskDueDate:{$ne:taskDate}};
    let sortBy={taskDueDate:1};
    col.find(query).toArray(function(err,result){
        if(err) throw err;
        console.log(result);
    });

});

function getNewRandomID(){
    let id;
    id=Math.round(Math.random()*1000);
    return id;
}




app.listen(8080);