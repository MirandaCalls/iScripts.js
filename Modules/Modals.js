async function inputPrompt( title, placeholder, value ) {
	let alert = new Alert();
	alert.title = title;
	alert.addTextField( placeholder, value );
	alert.addAction( "Save" );
	await alert.presentAlert();
	
	return alert.textFieldValue( 0 );
}

async function selectFromMenu( actions ) {
	let alert = new Alert();

	actions.forEach( ( action ) => {
		if ( false == action.isDestructive() ) {
			alert.addAction( action.getTitle() );
		} else {
			alert.addDestructiveAction( action.getTitle() );
		}
	} );
	alert.addCancelAction( 'Cancel' );
	let idx_result = await alert.presentSheet();

	if ( idx_result != -1 ) {
		actions[ idx_result ].runCallback();
	}
}

class ModalAction {
    constructor( title, callback ) {
        this._title = title;
        this._callback = callback;
        this._destructive = false;
    }

    getTitle() {
        return this._title;
    }

    isDestructive() {
        return this._destructive;
    }

    setDestructive( isDestructive ) {
        this._destructive = isDestructive;
    }

    runCallback() {
        this._callback();
    }
}

module.exports = {
    inputPrompt: inputPrompt,
    selectFromMenu: selectFromMenu,
    ModalAction: ModalAction
}