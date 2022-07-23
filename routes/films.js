const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Films = require('../models/films');
const Directors = require('../models/directors');
const uploadPath = path.join('public', Films.coverImageBasePath);
const imageMimeTypes = ['image/jpeg','image/jpg', 'image/png', 'image/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback)=>{
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

router.get('/', async (req, res)=>{
    let query = Films.find({});
    if(req.query.title){
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if(req.query.publishedBefore){
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if(req.query.publishedAfter){
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    try{
        const films = await query.exec();
        res.render('films/index', {
            films,
            searchOption: req.query
        });
    }catch{
        res.redirect('/');
    }
});

router.get('/new', async (req, res)=>{
    renderNewPage(res, new Films());
});

router.post('/', upload.single('cover'), async (req, res)=>{
    const fileName = req.file != null ? req.file.filename : null;
    const films = new Films({
        title: req.body.title,
        director: req.body.director.trim(),
        publishDate: new Date(req.body.publishDate),
        duration: req.body.duration,
        coverImageName: fileName,
        description: req.body.description
    });
    try {
        const newFilm = await films.save();
        res.redirect(`films`);
    } catch {
        if(films.coverImageName != null){
            removeCoverImageName(films.coverImageName);
        }
        renderNewPage(res, films, true);
    }
});

function removeCoverImageName(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
       if(err) console.error(err);
    });
}

async function renderNewPage (res, films, hasError = false){
    try{
        const directors = await Directors.find({});
        const params =  {
            directors,
            films,
        };
        if(hasError) {params.errorMessage = 'Error Creating Film';}
        res.render('films/new', params);
    } catch{
        res.redirect('/films');
    }
}

module.exports = router;