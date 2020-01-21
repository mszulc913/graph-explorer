
const N3 = require('n3');

export class NTToGraphImporter {
    constructor(content) {
        this.content = content
    }

    import(){
        const parser = new N3.Parser();
        const quads = parser.parse(
            this.content
        );
        
        let predicates = []

        quads.forEach(quad => {
            let object = this._parseEntity(quad.object)
            let subject = this._parseEntity(quad.subject)
            predicates.push(this._parsePredicate(subject, quad.predicate, object))
        })

        return predicates
    }

    _parseEntity(entity){
        
        let output = {
            value: entity.value,
            type: entity.datatype ? "literal" : 'uri',
            datatype: entity.datatype ? entity.datatype.id : null,
            language: entity.language ? entity.language : null,
            id: entity.id,
        }
        return output
    }

    _parsePredicate(subject, predicate, object){
        let output = {
            subject: subject,
            property: {
                predicate: {
                    value: predicate.id
                }
            },
            object: object,
        }
        return output
    }


}