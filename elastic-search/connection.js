var elasticSearchURL = "35.196.63.188:9200/"
var elasticSearch = require('elasticsearch')

var client = new elasticSearch.Client({
    hosts: [
        elasticSearchURL
    ]
});

module.exports = client