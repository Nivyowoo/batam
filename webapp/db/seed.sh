mongoimport --db batam --collection builds --file ./db/builds.json --jsonArray
mongoimport --db batam --collection reports --file ./db/reports.json --jsonArray
mongoimport --db batam --collection tests --file ./db/tests.json --jsonArray
