String.prototype.replaceByIndex = function( idxStart, idxEnd, content ) {
	return this.substring( 0, idxStart ) + content + this.substring( idxEnd );
}

function renderTemplate( fileName, data ) {
	let fm = FileManager.iCloud();
	let templatePath = fm.joinPath( fm.documentsDirectory(), "Templates/" + fileName );
	let html = fm.readString( templatePath );

	let idx_iterator;
	while ( ( idx_iterator = html.indexOf( '{%' ) ) !== -1 ) {
		let idx_tag_end = html.indexOf( '%}' );
		if ( idx_tag_end === -1 ) {
			throw Error( 'No closing %} for iterator.' );
		}
		let array_name = html.substring( idx_iterator + 2, idx_tag_end );
		if ( !( array_name in data ) ) {
			throw Error( 'No data provided for "' + array_name + '".' );
		}

		let idx_iterator_end = html.indexOf( '{%end%}' );
		if ( idx_iterator_end === -1 ) {
			throw Error( 'No closing {%end%} for iterator.' );
		}

		let iterator_template = html.substring( idx_tag_end + 2, idx_iterator_end );
		let iterated_content = '';
		data[ array_name ].forEach( ( obj ) => {
			iterated_content += renderValues( iterator_template, obj );
		} );

		let idx_replace_start = idx_iterator;
		let idx_replace_end = idx_iterator_end + 7;
		html = html.replaceByIndex( idx_replace_start, idx_replace_end, iterated_content );
	}

	html = renderValues( html, data );

	WebView.loadHTML( html );
}

function renderValues( content, data ) {
	let idx_replace_value;
	while ( ( idx_replace_value = content.indexOf( '{{' ) ) !== -1 ) {
		let idx_value_end = content.indexOf( '}}', idx_replace_value );
		if ( idx_value_end === -1 ) {
			throw Error( 'No closing }} for value.' );
		}
		let data_name = content.substring( idx_replace_value + 2, idx_value_end );
		if ( !( data_name in data ) ) {
			throw Error( 'No data provided for "' + data_name + '"' );
		}
		content = content.replaceByIndex( idx_replace_value, idx_value_end + 2, data[ data_name ] );
	}

	return content;
}

module.exports = {
    renderTemplate: renderTemplate
}