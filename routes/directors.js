const express = require('express');
const router = express.Router();
const Director = require('../models/directors');
const Film = require('../models/films');

router.get('/', async (req,res)=>{
    let searchOption = {};
    if(req.query.name !== null && req.query.name !== ''){
        searchOption.name = new RegExp(req.query.name, 'i');
    }
    try{
        const directors = await Director.find(searchOption);
        res.render("directors/index", {
            directors,
            searchOption: req.query
        });
    }catch{
        res.redirect('/');
    }
});

router.get('/new', (req, res)=>{
    res.render("directors/new", {directors: new Director()});
});


router.post('/', async (req, res)=>{
    const directors = new Director({
        name: req.body.name
    });
    try{
        const newDirector = await directors.save();
        res.redirect(`directors`);
    } catch{
        res.render('directors/new', {
            directors,
            errorMessage: 'Error creating Director'
        });
    }
});

router.get('/:id', async (req, res)=>{
    try {
        const directors = await Director.findById(req.params.id);
        const films = await Film.find({director: directors.id}).exec();
        res.render('directors/show', {
            directors,
            filmsByDirector: films
        });
    } catch {
        res.redirect('/');
    }
});
router.get('/:id/edit', async (req, res)=>{
    try {
        const directors = await Director.findById(req.params.id);
        res.render('directors/edit', {directors});
    } catch {
        res.redirect('directors');
    }
});
router.put('/:id', async (req, res)=>{
    let directors;
    try{
        directors = await Director.findById(req.params.id);
        directors.name = req.body.name;
        await directors.save();
        res.redirect(`/directors/${directors.id}`);
    } catch{
        if(directors == null){
            res.redirect('/');
        } else{
            res.render('directors/edit', {
                directors,
                errorMessage: 'Error updating Director'
            });
        }
    }
});
router.delete('/:id', async (req, res)=>{
    let directors;
    try{
        directors = await Director.findById(req.params.id);
        await directors.remove();
        res.redirect(`/directors`);
    } catch{
        if(directors == null){
            res.redirect('/');
        } else{
            res.redirect(`/directors/${directors.id}`);
        }
    }
});
module.exports = router;