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
                `?s${i - 1} (!<>)|^(!<>) ?s${i} .`
            )
            queryFilterStatements.push(`FILTER(!isLiteral(?s${i - 1}) ) .`)
        }
    
        var query = `
            SELECT DISTINCT *
            WHERE {
                BIND(<${node1.data.value}> as ?s0) .
                BIND(<${node2.data.value}> as ?s${i}) .
                ?s0 (!<>)|^(!<>) ?s1 . ${queryMiddleStatements.join('\n')}
                ?s${i - 1} (!<>)|^(!<>) ?s${len} .
                ${queryFilterStatements.join('\n')}
            } LIMIT 1`


    } else {
        query = `
        SELECT DISTINCT *
        WHERE {
            BIND(<${node1.data.value}> as ?s0)
            BIND(<${node2.data.value}> as ?s1)
            ?s0 (!<>)|^(!<>) ?s1
        } LIMIT 2`

    }

    return query
}

Utils.buildFindPathPropertiesQuery = function (nodes) {
    let queryMiddleStatements = []
    for (let i = 0; i < nodes.length - 1; i++) {
        queryMiddleStatements.push(
            `{<${nodes[i].value}> ?y${i} <${nodes[i + 1].value}>}
             UNION {<${nodes[i + 1].value}> ?y${i} <${nodes[i].value}>} .`
        )
    }

    const query = `
        SELECT DISTINCT *
        WHERE {
            ${queryMiddleStatements.join('\n')}
        } LIMIT 1`

    return query
}



export { Utils }