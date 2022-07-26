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
        res.redirect(`films/${films.id}`);
    } catch {
        renderNewPage(res, films, true);
    }
});

router.get('/:id', async (req,res)=>{
    try {
        const film = await Films.findById(req.params.id).populate('director').exec();
        res.render('films/show', {film});
    } catch {
        res.redirect('/');
    }
});

router.get('/:id/edit', async (req, res)=>{
    try{
        const film = await Films.findById(req.params.id);
        renderEditPage(res, film);
    } catch {
        res.redirect('/');
    }
});

router.put('/:id', async (req, res)=>{
    let film;
    try {
        film = await Films.findById(req.params.id);
        film.title= req.body.title;
        film.director= req.body.director;
        film.publishDate= new Date(req.body.publishDate);
        film.duration= req.body.duration;
        film.description= req.body.description;
        if(req.body.cover != null && req.body.cover != ''){
            saveCover(film, req.body.cover);
        }
        await film.save();
        res.redirect(`/films/${film.id}`);
    } catch (err) {
        if(film != null){
            renderEditPage(res, film, true);
        }
        res.redirect('/');
    }
});

router.delete('/:id', async (req, res)=>{
    let films;
    try{
        films = await Films.findById(req.params.id);
        await films.remove();
        res.redirect('/films');
    } catch{
        if(films != null){
            res.render('films/show', {
                films,
                errorMessage: "Couldn't Remove Film"
            });
        } else {
            res.redirect('/');
        }
    }
});


async function renderNewPage (res, films, hasError = false){
    renderFormPage(res, films, 'new', hasError);
}

async function renderEditPage (res, films, hasError = false){
    renderFormPage(res, films, 'edit', hasError);
}

async function renderFormPage (res, films, form, hasError = false){
    try{
        const directors = await Directors.find({});
        const params =  {
            directors,
            films,
        };
        if(hasError) {
            if(from === 'edit'){
                params.errorMessage = 'Error Updating Film';
            } else if(form === 'new'){
                params.errorMessage = 'Error Creating Film';
            }
        }
        res.render(`films/${form}`, params);
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