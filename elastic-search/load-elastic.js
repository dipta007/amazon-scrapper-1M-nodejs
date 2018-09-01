var fs = require('fs')
var products = require('../JSON/Fjson.json')
var elasticSearch = require('./elastic')
const uuidv4 = require('uuid/v4')

elasticSearch.createIndex('amazon').then((response) => {
    bulk = []
    products.forEach(item => {
        bulk.push(
            {index: {_index: 'amazon', _type: 'product-title', _id: uuidv4()}},
            {
                'productname': item.title
            }
        );
    });
    console.log(bulk.length)
    elasticSearch.insertMany('amazon', 'product-title', bulk).then((response) => {
        elasticSearch.countDocuments('amazon', 'product-title').then(count => {
            console.log(count)
        })
    })

})