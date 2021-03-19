import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import ejs from 'ejs'
import multer from 'multer'
import mongoose from 'mongoose'
import fs from 'fs'
import bodyParser from 'body-parser'
const currentFolder = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const upload = multer({
    dest: 'images',
    limits: {
    fileSize: 100000000,
    },
    // fileFilter(req, file, cb) {
    //     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)){
    //         cb(new Error('Please upload an image.'))
    //     }
    //     cb(undefined, true)
    // }
    })
    const questionSchema = new mongoose.Schema({
        time: Date,
        destUserID: String,
        imgPath: String, 
        question: {
            question: String,
            hint: String,
            answerA:{
                text: String,
                isCorrect: Boolean
            },
            answerB:{
                text: String,
                isCorrect: Boolean
            },
            answerC:{
                text: String,
                isCorrect: Boolean
            },
            answered : Number,
            answeredCorrectly: Number
        }
    })
const Question = mongoose.model('Question', questionSchema)
mongoose.set('useFindAndModify', false);

// Connect to the mongo server, a database called 'bulletin'
await mongoose.connect('mongodb://localhost:27017/image', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
app.set('view engine', 'ejs')

app.use(express.static(currentFolder + '/public'));
app.use('/css', express.static(path.join(currentFolder, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(currentFolder, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(currentFolder, 'node_modules/jquery/dist')))
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/', express.static(path.join(currentFolder, 'public')))

app.get('/upload', (req, res) => { 
    res.render('upload.ejs')
}) 
app.post('/image', upload.single('upload'), async (req, res) => {
    var question = new Question({
        time: (new Date()).toISOString(),
    })
    console.log(req)
    console.log('BUffer ' + req.file)
    question.imgPath = req.file.path
    question.question = ""
    question.answer = ""
    question.hint = ""
    await question.save()
    res.json(question)
})
app.get('/addQuestions', async (req, res) => { 
    console.log(req.query.id)
    // let result =  await Question.findById(req.query.id)
    // console.log(result)
    // res.json(results)
    res.render('addQuestions.ejs', {imgId : req.query.id})
}) 
app.post('/submitQuestion', async (req, res) => {
    var query = {
        question: {
            question: String,
            hint: String,
            answerA:{
                text: String,
                isCorrect: Boolean
            },
            answerB:{
                text: String,
                isCorrect: Boolean
            },
            answerC:{
                text: String,
                isCorrect: Boolean
            },
        }
    }
    query.question.question = req.body.question
    query.question.answerA.text = req.body.answerA
    query.question.answerA.isCorrect = req.body.answerAIsCorrect == true
    query.question.answerB.text = req.body.answerB
    query.question.answerB.isCorrect = req.body.answerBIsCorrect == true
    query.question.answerC.text = req.body.answerC
    query.question.answerC.isCorrect = req.body.answerCIsCorrect == true
    query.question.hint = req.body.hint
    query.question.answered = 0
    query.question.answeredCorrectly = 0


    Question.findOneAndUpdate(req.body.questionId, query, {upsert: true}, function(err, doc) {
        if (err) return res.send(500, {error: err});
        //return res.send('Succesfully saved.');
    });
    var results = {};
    await Question.find({}, function(err, questions) {
    
        questions.forEach(function(question) {
          results[question._id] = question;
        });
        console.log(results)
        
        res.render('dashboard.ejs', {data: results} );  
      });
})

app.get('/dashboard', async (req, res) => { 
    var results = {};
    await Question.find({}, function(err, questions) {
    
        questions.forEach(function(question) {
          results[question._id] = question;
        });
        console.log(results)
        
        res.render('dashboard.ejs', {data: results} );  
      });
    //res.render('dashboard.ejs')

}) 

app.get('/:id/image', async (req, res) => {

    try{
        const result = await Question.findById(req.params.id)
        console.log(result)
        if (!result || !result.imgPath) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.sendFile(currentFolder + '/' + result.imgPath)
    } 
    catch(e) {
        res.status(404).send()
    }
})
app.listen(3000, () => {
  console.log('Listening at http://localhost:3000')
})