const express= require('express')
const app= express();
// const Pool = require('pg').Pool
const pool = require('./db')
const path = require('path');
const ejs=require('ejs');
const PORT =3000;
require ('dotenv').config();



pool.connect((err,client,release)=>{
    if(err){
        return console.log('Error in connection')
    }
    client.query('SELECT NOW()',(err,result)=>{
        release()
        if(err){
            return console.error('Error executing query')
        }
        console.log("connected to the database")
    })
})


app.set('views', path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use('/static',express.static('static'))

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get('/',async(req,res)=>{
    const data = await pool.query(`SELECT * FROM todo ORDER BY date`)
    res.render('index',{data: data.rows})
})
app.post('/filter',async(req,res)=>{
    const searchDate = req.body.date
    const data=await pool.query(`SELECT * FROM todo WHERE date='${searchDate}'`)
   
    res.render('filter',{data: data.rows})
})



//CREATE todo
app.post('/addTodo',async(req,res)=>{
    const {todo,date} = req.body;

    try{
        const result = await pool.query(`INSERT INTO todo (todo, date) VALUES ($1,$2)
    
            RETURNING *`,[todo, date])
            console.log(result);
            // res.redirect('/') 
            res.json(result.rows[0]);

    }
    catch(err){
        console.log('error in addding todo');
        res.status(500).json({error:'Internal Server Error'})
    }
})

//get all todos
app.get("/todo", async(req,res)=>{
    try{
        const allTodos = await pool.query("SELECT * FROM todo");
        res.json(allTodos.rows)
    }
    catch(err){
        console.log(err.message)
    }
})
//get a todo
app.get("/todo/:id", async(req,res)=>{
    try{
       const {id} = req.params;
       const todo = await pool.query("SELECT * FROM todo where todo_id =$1",[id] )
       res.json(todo.rows[0]);

    }
    catch(err){
        console.log(err.message)
        

    }
})

//UPDATE
app.get('/edit/:id',async(req,res)=>{
    const id = req.params.id;
    const data = await pool.query(`SELECT * FROM todo WHERE id= $1`,[id])
    res.render('edit',{data:data.rows})
})

app.post('/update/:id',async(req,res)=>{
    const id = req.params.id;
    const{todo,date} = req.body;
    try{
        await pool.query(`UPDATE todo SET todo =$1, date = $2 WHERE id= $3`, [todo,date,id])
        res.redirect('/')
    }
    catch(err){
        console.log('Error updatingthe todo')
        res.status(500).json({error:'Internal Server Error'})
    }

})


//DELETE



app.get('/delete/:id',async(req,res)=>{
   try{ const id = req.params.id;
    await pool.query(`DELETE FROM todo WHERE id= $1`,[id])
    res.redirect('/')}
    catch(err){
        console.log('error deleting message')
    }

})
app.listen(PORT,()=>{
    console.log('Server is connected')
})


