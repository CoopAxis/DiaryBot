/**
 * diaryBot.js
 */

"use strict";

var diaryBot =
{
	db : null ,
	// NO LIMIT ;-)
	// maxNextItems : 10 ,
    sthNextItemsFirst : null ,
    sthNextItemsNext : null ,
    sthNextItemsWithout : null ,
    sthItemWeightFirst : null ,
    sthItemWeightNextUpdate : null ,
    sthItemWeightNextInsert : null ,

	initDb : function()
	{
		this.sthNextItemsFirst = this.db.prepare('SELECT * FROM items ORDER BY weight DESC, label ASC' );

	    var sql = 'SELECT i2.id, i2.label, i2.item_types_id, items_has_items.weight ';
	    sql+= ' FROM items i2' ;
	    sql+= ' LEFT JOIN items_has_items ON ( items_id_next = i2.id )' ;
	    //sql+= ' LEFT JOIN items i1 ON ( items_id = i1.id )' ;
	    sql+= ' WHERE items_id = $previousId' ;
	    sql+= ' ORDER BY items_has_items.weight DESC, i2.label ASC' ;
	    this.sthNextItemsNext = this.db.prepare( sql );

	    // The variable parameters binding is not possible with prepared stm
	    //this.sthNextItemsWithoutIds = this.db.prepare( 'SELECT * FROM items WHERE id NOT IN ( $filteredIds ) ORDER BY label ASC' );
	    this.sthNextItemsWithoutIds = this.db.prepare( 'SELECT * FROM items ORDER BY label ASC' );

	    this.sthItemWeightFirstUpdate = this.db.prepare( 'UPDATE items SET weight = weight+1 WHERE id=$id' );

	    this.sthItemWeightNextSelect = this.db.prepare( 'SELECT * FROM items_has_items WHERE items_id = $idFrom and items_id_next = $idTo' );
	    this.sthItemWeightNextUpdate = this.db.prepare( 'UPDATE items_has_items SET weight = weight+1 WHERE items_id = $idFrom and items_id_next = $idTo' );
	    //this.sthItemWeightNextInsert = this.db.prepare( 'INSERT INTO items_has_items (items_id, items_id_next, weight) VALUES ($idFrom, $idTo, 1)' );
	    this.sthItemWeightNextInsert = this.db.prepare( 'INSERT INTO items_has_items (items_id, items_id_next) VALUES ($idFrom, $idTo)' );
	},

	linkItem : function( itemFrom, itemTo )
    {
    	if( typeof itemTo === 'undefined' || itemTo == null )
    	{
    		console.log( 'add weight to "'+itemFrom.label+'"' );
    		this.sthItemWeightFirstUpdate.run( { $id:itemFrom.id } );
    	}
    	else
    	{
    		console.log('add weight to link "'+itemFrom.label+'"-"'+itemTo.label+'"');
    		var row = diaryBot.sthItemWeightNextSelect.get( { $idFrom:itemFrom.id, $idTo:itemTo.id } );
    		if( typeof row === 'undefined' || row.length == 0 )
    		{
    			this.sthItemWeightNextInsert.run( { $idFrom:itemFrom.id, $idTo:itemTo.id } );	
    		}
    		else
    		{
    			this.sthItemWeightNextUpdate.run( { $idFrom:itemFrom.id, $idTo:itemTo.id } ); 			
    		}
    	}
    },

	nextItems : function( previousId )
	{
		var	self = this,
			rows = [] ;

		if( typeof previousId === 'undefined' || previousId == null )
		{
			// Élément racine d'une story

			var sth = self.sthNextItemsFirst ;
			while( sth.step() )
			{
		        rows.push( sth.getAsObject() );
			}
		}
		else
		{
			// Éléments suivants d'une story

			var sth, o, filteredIds = [];

			sth = self.sthNextItemsNext ;
		    sth.bind({$previousId:previousId});
			while( sth.step() )
			{
				o = sth.getAsObject();
				// The weight is the link's weight
				console.log('found link ',o.label, o.weight);
		        rows.push( o );
		        filteredIds.push( o.id );
			}

			sth = self.sthNextItemsWithoutIds ;
			//sth.bind( {$filteredIds:filteredIds.join(',')} );
			while( sth.step() )
			{
				o = sth.getAsObject();
				if( filteredIds.indexOf(o.id) >= 0 )
				{
					// skip filtered ids
					continue ;
				}
				// Remove item's weight
				o.weight = 0 ;
		        rows.push( o );
			}
		}
		return rows ;
	},

	create : function( sql )
	{
		this.db = new SQL.Database();
		this.db.run( sql );
		this.initDb(); 
	},

	loadFromBinString : function( str )
	{
		var l = str.length,
        arr = new Uint8Array(l);
		for (var i=0; i<l; i++)
			arr[i] = str.charCodeAt(i);
		this.db = new SQL.Database( arr );
		this.db.run( 'SELECT * FROM sqlite_master');
		this.initDb();
	},

	toBinString : function()
	{
	    var uarr = new Uint8Array( this.db.export() );
	    var strings = [], chunksize = 0xffff;
	    // There is a maximum stack size. We cannot call String.fromCharCode with as many arguments as we want
	    for (var i=0; i*chunksize < uarr.length; i++){
	        strings.push(String.fromCharCode.apply(null, uarr.subarray(i*chunksize, (i+1)*chunksize)));
	    }
	    return strings.join('');
	}

};
