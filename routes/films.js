const express = require('express');
const router = express.Router();
const Films = require('../models/films');
const Directors = require('../models/directors');
const imageMimeTypes = ['image/jpeg','image/jpg', 'image/png', 'image/gif'];

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

router.post('/', async (req, res)=>{
    const films = new Films({
        title: req.body.title,
        director: req.body.director.trim(),
        publishDate: new Date(req.body.publishDate),
        duration: req.body.duration,
        description: req.body.description
    });
    saveCover(films, req.body.cover);
    try {
        const newFilm = await films.save();
        res.redirect(`films`);
    } catch {
        renderNewPage(res, films, true);
    }
});

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

function saveCover(films, coverEncoded){
    if(coverEncoded == null) return;
    const cover  = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)){
        films.coverImage = new Buffer.from(cover.data, 'base64');
        films.coverImageType = cover.type;
    }
}

module.exports = router;