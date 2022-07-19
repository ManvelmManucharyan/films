const express = require('express');
const router = express.Router();
const Director = require('../models/directors');

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

module.exports = router;