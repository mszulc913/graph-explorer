
import { Consts } from "./consts.js"

function Utils() { }

Utils.formatLabel = function (value, maxLabelLen) {
    var splitted = ""
    if (value.includes("#"))
        splitted = value.split("#");
    else 
        splitted = value.split("/");

    if (splitted[splitted.length - 1].length > maxLabelLen)
        return splitted[splitted.length - 1].slice(0, maxLabelLen) + "...";
    else
        return splitted[splitted.length - 1];
};

Utils.buildFindPathQuery = function (node1, node2, len) {

    if (len > 1){
        let queryMiddleStatements = []
        let queryFilterStatements = []
        let i = 2
    
        queryFilterStatements.push(`FILTER(!isLiteral(?s${1})) .`)
        for (i; i < len; i++) {
            queryMiddleStatements.push(
                `?s${i - 1} (!<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)|^(!<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>) ?s${i} .`
            )
            queryFilterStatements.push(`FILTER(!isLiteral(?s${i - 1}) ) .`)
        }
    
        var query = `
            SELECT DISTINCT *
            WHERE {
                BIND(<${node1.data.value}> as ?s0) .
                BIND(<${node2.data.value}> as ?s${i}) .
                ?s0 (!<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)|^(!<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>) ?s1 .
                ${queryMiddleStatements.join('\n')}
                ?s${i - 1} (!<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)|^(!<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>) ?s${len} .
                ${queryFilterStatements.join('\n')}
            } LIMIT 2`


    } else {
        query = `
        SELECT DISTINCT *
        WHERE {
            BIND(<${node1.data.value}> as ?s0)
            BIND(<${node2.data.value}> as ?s1)
            ?s0 (!<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)|^(!<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>) ?s1
        } LIMIT 2`
    }

    return query
}

Utils.buildFindPathPropertiesQuery = function (nodes) {
    let queryFilterStatements = []
    let queryMiddleStatements = []
    for (let i = 0; i < nodes.length - 1; i++) {
        queryMiddleStatements.push(
            `{<${nodes[i].value}> ?y${i} <${nodes[i + 1].value}>}
             UNION {<${nodes[i + 1].value}> ?z${i} <${nodes[i].value}>} .`
        )
        queryFilterStatements.push(
            `FILTER(!regex(str(?y${i}), "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")) .
            FILTER(!regex(str(?z${i}), "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")) .`
        )
    }

    const query = `
        SELECT DISTINCT *
        WHERE {
            ${queryMiddleStatements.join('\n')}

        } LIMIT 1`

    return query
}

Utils.getRandomColor = function () {
    let items = [Consts.COLOR1, Consts.COLOR2, Consts.COLOR3]
    return items[Math.floor(Math.random()*items.length)];
}



export { Utils }