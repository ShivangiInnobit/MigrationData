var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({ hosts: ['http://localhost:9200'] });
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/elasticsearch');
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connection Successful!");

 
    let newTenantId = '851204a5-4e72-47fd-9bc5-6ce90dd7face' 

    
//Client  for elasticsearch
    client.ping({
        requestTimeout: 30000,
    },
        function (error) {
            if (error) {
                console.error('Cannot connect to Elasticsearch.');
                console.error(error); 

            } else {
                console.log('Connected to Elasticsearch was successful!');
            }
        });
    if (client) {
    
        client.search({
            index: 'batches-gs1',
            type: '_doc',
            body: {
                query: {
                    match: { "source.tenantId":"905c6e3f-a2d1-4ec3-bb7b-abb5202054b3"}

                   // "match_all": {}
                
                }
            }
            
        },        
            function (error, response, status) {

                if (error) {
                    console.log("search error: " + error)
                }
                else {

                    let final = []
                    let elasticData
                    console.log("response",response.hits.hits)
                    console.log(response.hits.hits)
                    response.hits.hits.forEach(function (hit) {
                        elasticData = {
                            tenantId: newTenantId,
                            batchId: hit._source.source.batchId,
                            userId: hit._source.source.lastOperator.id,
                            processId: hit._source.source.processId,
                            productId: hit._source.source.metadata.product.UPC,
                            productExperienceId: hit._source.source.metadata.product.experienceId,
                            productExperienceStudioId: hit._source.source.metadata.product.experienceStudioId,
                            productExperienceTenantId: hit._source.source.metadata.product.experienceTenantId,
                            productUpc: hit._source.source.metadata.product.UPC,
                            status: hit._source.source.status,
                        
                        }
                        final.push(elasticData)
                    })
                    db.collection("edatas").insertMany(final, function (err, res) {
                        if (err) throw err;
                        console.log("Inserted Successfully")
                        db.close();
                    })
                }
            });
    }
})