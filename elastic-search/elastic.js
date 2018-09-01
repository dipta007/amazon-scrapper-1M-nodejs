var client = require('./connection')

function existsIndex(ind) {
    return client.indices.exists({index: ind})
}

/*
ind = index
*/
function createIndex(ind) {
    return existsIndex(ind).then((resp) => {
        if(!resp)
            return client.indices.create({index: ind})
    })
}

/*
ind = index
*/
function deleteIndex(ind) {
    return client.indices.delete({index: ind})
}





/*
data = {
    index: 'gov',
    id: '1',
    type: 'constituencies',
    body: {
        "ConstituencyName": "Ipswich",
        "ConstituencyID": "E14000761",
        "ConstituencyType": "Borough",
        "Electorate": 74499,
        "ValidVotes": 48694,
    }
}
*/
function insertOne(data) {
    return createIndex('amazon').then((resp) => {
        client.index(data, function(err, resp, status) {
            console.log(resp._id)
        })
    })
}

/*
data = 
    { index: {_index: 'gov', _type: 'constituencies', _id: '1' } }, 
    {
        "ConstituencyName": "Ipswich",
        "ConstituencyID": "E14000761",
        "ConstituencyType": "Borough"
        ...
    }
*/
function insertMany(ind, ty, data) {
    return client.bulk( {
        index: ind,
        type: ty,
        body: data
    })
}

/*
ind = index
ty = type
*/
function countDocuments(ind, ty) {
    return client.count({index: ind, type: ty})
}

/*
data = {  
    index: 'gov',
    id: '1',
    type: 'constituencies'
}
*/
function deleteDocument(data) {
    client.delete(data, function(err, resp, status) {
        console.log(resp)
    })
}

function search(ind, ty, text) {
    return client.search({
        index: ind,
        type: ty,
        scroll: '10s',
        body: {
            query: {
                match: { productname: text }
            },
        }
    })
}

function getAll(ind, ty) {
    return client.search({
        index: ind,
        type: ty,
        scroll: '10s',
        body: {
            query: {
                match_all : {}
            },
        }
    })
}

module.exports = {
    createIndex: createIndex,
    deleteIndex: deleteIndex,
    insertOne: insertOne,
    insertMany: insertMany,
    countDocuments: countDocuments,
    deleteDocument: deleteDocument,
    search: search,
    getAll: getAll
}