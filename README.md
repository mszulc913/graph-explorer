# RDF Graph Explorer
Simple app that allows to explore *Linkedmdb* and *DBTropes* RDF graphs. Written with Vue.js. Apache Jena Fuseki is used as the permament triple store.  

### Requirements
*docker* with *docker-compose* is required to run the app.

## Installation
Note: password for the *Jena Fuseki* admin panel is stored in the *db/fuseki/shiro.ino*, you can change it before
building the containers or leave it as it is.  

To build the containers type
```
docker-compose build
```
To run the app type
```
docker-compose up -d
```

## Populating the database

The app requires data sources to be imported into the database.  

### Via script
Command bellow will download the data and import it to the database
```
docker-compose exec db bash /fuseki/populate_db.sh
```


### Manually
On some distibutions (eg. Fedora), loading of **DBTropes** data will fail due to the limited memory of docker containers.
Iin that case input files
should be downloaded manually from:
    http://dbtropes.org/static/dbtropes.zip and
    https://query.data.world/s/n5acuyvz4gmvjguqidnz6jjuhjewdn  
Downloaded *.nt* files should be placed in the */input* directory. 
Additionally, 18012846 line from the DBTropes dataset is broken and should be removed:
```
docker-compose exec db sed -i '18012846d' /staging/{dbtropes .nt file name}
```

After that operation, 
data can be imported by running the following:
```
docker-compose  exec db ./load.sh  dbtropes /staging/{dbtropes .nt file name}
docker-compose  exec db ./load.sh  linkedmdb /staging/{linkedmdb .nt file name}
```

### Creating datasets
After the data was uploaded, new datasets should be created in the admin panel (http://localhost:3030).  
Two permament datasets with names *dbtropes* and *linkedmdb* should be created.  
After that operation,
containers restart is required:

```
docker-compose restart
```
### Play with the graph
Application works on port 8080 (http://localhost:8080)