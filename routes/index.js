const express = require('express');
const router = express.Router();
const Films = require('../models/films');

router.get('/', async (req,res)=>{
    let films;
    try {
        films = await Films.find().sort({createdAt : 'desc'}).limit(10).exec();
    } catch {
        films = [];
    }
    res.render("index", {films});
});

module.exports = router;