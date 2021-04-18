var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
		host: 'localhost:9200'
	});
var allRecords =[];	

module.exports = function(app) {	
 app.get('/api/data', function(req, res) {

client.search({
 
 index: 'finalnewsdata',
  type: 'doc',
  scroll: '40m',
  _source: ['media-type','datePublished','source','title','newslength','Category_Predicted'],     // change source to all
body:{
  query: {
   bool: {
           "match_all": {}
          }
}
}

 /* 
  index: 'finalnewsdata',
  type: 'doc',
  scroll: '40m',
  _source: ['media-type'],     // change source to all
body:{
	query: {
	 bool: {
					  must: [
						{
						    match: {
							     "title": "Lufthansa"
						    }
						}
					  ]
					}
}
}
*/

}, function getMoreUntilDone(error, response) {
  // collect all the records
  response.hits.hits.forEach(function (res) {
	  console.log("total hits:::",allRecords.length)
    allRecords.push(res["_source"]);
});
 if (response.hits.total.value > allRecords.length) {
    // now we can call scroll over and over
    client.scroll({
      scrollId: response._scroll_id,
      scroll: '40m'
    }, getMoreUntilDone);
  }
  else
  { 
//res.json(allRecords);}
	if(error)
   res.send(error);
 console.log("all records----",allRecords);
 res.json(allRecords);
}
});
 });

 
  // frontend routes =========================================================
 app.get('*', function(req, res) {
  res.sendFile('/Users/ssm392/Desktop/vizproject/public/index.html');
 });

}