// nlp/name_checker.js
// IMPORTING THE NECESSARY PACKAGES ---------
const nlp = require('nlp_compromise');
const _   = require('lodash');



// function to check if the query contains name of user or not
module.exports = (data, lexicon, done) => {

	// detokenize the sentence and gives Parts-of-Speech tagging
	let content = nlp.sentence(data.content, {lexicon: lexicon});

	let a = find_people(data, content, lexicon);
	if(!a) {
		done('No middle name provided');
	}
	else {
		return done(null, a.normal);
	}


}

function find_people(data, content, lexicon) {
	// finding if there is a name of person in the sentence
	let people = content.people();

	// if a name is found and it is 'I' then filter it out
	people = _.filter(people, data => {
		if(data.normal === 'i') {
			return false;
		}
		return true;
	});
	if(people.length !== 0) {
		return people;
	}
	else {
		let sent_terms = content.terms;
		let nouns = _.filter(sent_terms, (data) => {
			if(data.pos.Noun && !data.pos.Pronoun) {
				return true;
			}
			return false;
		});

		if(nouns.length === 0) {
			return null;
		}

		// if there are nouns in the sentence then they are probably names
		let name_terms = nouns[0].normal.split(' ');
		if (name_terms.length === 1) {

            // add the names for future references
            lexicon[name_terms[0]] = 'Person';
        } else if (name_terms.length === 2) {
            lexicon[name_terms[0]] = 'Person';
        } else if (name_terms.length === 3) {
            lexicon[name_terms[0]] = 'Person';
            lexicon[name_terms[1]] = 'Person';
        }

        content = nlp.sentence(data.content, { lexicon: lexicon });
        people = content.people();

        if(people[0].text === 'I') {
        	people[0] = people[1];
        }

        if(people.length !== 0) {
        	return people[0];
        }
        else {
        	return null;
        }

	}
}