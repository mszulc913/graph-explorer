
const N3 = require('n3');

export class NTToGraphImporter {
    constructor(content) {
        this.content = content
    }

    import(){
        const parser = new N3.Parser({ blankNodePrefix: '' });
        const quads = parser.parse(
            this.content
        );
        
        let predicates = []
        let nodes = []

        quads.forEach(quad => {
            let object = this._parseEntity(quad.object)
            let subject = this._parseEntity(quad.subject)

            if (object.id === '_:x'){
                nodes.push(subject)
            } else if (subject.id == '_:x'){
                nodes.push(object)
            } else {
                predicates.push(this._parsePredicate(subject, quad.predicate, object))
            }
        })

        return {
            predicates: predicates,
            nodes: nodes
        } 
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