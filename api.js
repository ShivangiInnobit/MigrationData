var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({ hosts: ['http://localhost:9200'] });
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/elasticsearch', { retryWrites: false });
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connection Successful!");

    let newTenantId = '851204a5-4e72-47fd-9bc5-6ce90dd7face'


    let newProcesses = [
        { 'de68790d-8e11-466e-9eb6-f59b156d4afc': 'dd7b688e-46c6-4a0e-a7f7-8da3852e37e7' },
        { 'c7280b8d-2239-4d40-adc0-bacea848d3c7': 'a1b05724-ad23-4b8d-a7bc-a0e2dbbd688f' },
        { 'ec55dbef-93e5-45a2-ac62-4e4619e5e6f4': '83568b92-9c32-4e30-9c28-f94451c0402d' },
        { '42f4435c-686e-466a-8616-e884be483f64': '6d5640ae-f81b-401b-b81f-c60fa4644a50' },
        { 'ec343d43-a6f7-4f6a-9285-934119d0d592': '76bc8d88-3782-4311-82dd-4c4b3eb253cb' },
        { '0eb484d5-8f21-4418-9e9c-70ac3e89eaaf': 'fe3f95da-1850-46f1-8453-4767240cb52e' },
        { '6bad8cb7-68c4-4234-9607-f03fc226522a': 'b21e286b-0ac1-4e8a-a7b9-760aa806b902' },
        { '70c9bfc7-2cad-418c-a048-c3f69a15ea63': '07adec16-7db3-4073-a4fc-5c7afd6ba99a' },
        { 'b7f063f2-af45-4b3c-a22a-318ca162205b': '1cc2b059-5c75-4dee-9b1a-2a8e9b5b1da3' },
        { '31a6f4ae-ad87-46c1-b487-7301c735d711': '1745d41b-2759-41cc-8602-439a9bb6fd1d' },
        { 'bf94251a-86c4-4683-baf9-9f27443510d4': '71300d1f-4f88-4c8c-8fe2-4508d2bacd24' },
        { 'be6a2d9f-1a13-4801-a539-4941731533e3': '5486c3a7-a3e2-4e24-a9e3-6f60fc911071' },
        { '7a809da1-dc0a-497d-b733-40a607090110': 'c9d5ec43-9e2a-4155-bfad-50661fb466f4' },
        { '5a2e6bea-4518-4b97-a6aa-ec79c1674530': '425cdd0e-0f28-409b-aa4a-1056d25776f7' },
        { '26e1d985-147e-4449-94bc-f21811330865': 'c8431bd1-b6be-4817-a98a-87bebf5b2021' }
    ];


    //Client  for elastic search
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
            index: 'enablements-gs1',
            type: '_doc',
            body: {
                query: {
                    match: { "source.tenantId": "905c6e3f-a2d1-4ec3-bb7b-abb5202054b3" }
                    //"match_all": {}
                }
            }

        },
            function (error, response, status) {

                if (error) {
                    console.log("search error: " + error)
                }
                else {

                    let finalData = []
                    let enablementData
                    response.hits.hits.forEach(function (hit) {
                        let id = hit._source.source.processId
                        var newArray = newProcesses.filter(function (item) {
                            let key = Object.keys(item)
                            return key[0] === id;
                        });

                        enablementData = {
                            tenantId: newTenantId,
                            userId: hit._source.source.lastOperator.id,
                            processId: Object.values(newArray[0])[0],
                            productId: Object.values(productArry[0])[0],
                            productExperienceId: hit._source.source.metadata.product.experienceId,
                            productExperienceStudioId: hit._source.source.metadata.product.experienceStudioId,
                            productExperienceTenantId: hit._source.source.metadata.product.experienceTenantId,
                            productUpc: hit._source.source.metadata.product.UPC,
                            status: hit._source.source.status,
                            deviceId: hit._source.source.operations[0].station.serialNumber,
                            siteId: hit._source.source.operations[0].factory.id,
                            zoneId: hit._source.source.enablementType,
                            diId: hit._source.source.metadata.nfc[0].id,
                            diInfo: hit._source.source.metadata,
                            primaryURL: hit._source.source.projectId,
                            primaryId: hit._source.source.tenant,
                            primaryIdType: hit._source.source.activated,
                            productDescription: hit._source.source.product.description,
                            operationTime: hit._source.source.lastOperationTimestamp
                        }

                        finalData.push(enablementData)

                    })
                    db.collection("enablementdatas").insertMany(finalData, function (err, res) {
                        if (err) throw err;
                        console.log("Inserted Successfully")
                        db.close();
                    })
                }
            });
    }
})