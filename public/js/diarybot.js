/**
 * diarybot.js
 */

var diaryBot =
{
	db : null ,
	// NO LIMIT ;-)
	// maxNextItems : 10 ,
    sthNextItemsFirst : null ,
    sthNextItemsNext : null ,
    sthNextItemsWithout : null ,

	nextItems : function( previousId )
	{
		var self = this ;
		return new Promise( function( resolve, reject )
		{
			if( typeof previousId === 'undefined' )
			{
				var sth = self.sthNextItemsFirst ;
				var rows = [] ;
				while( sth.step() )
				{
			        rows.push( sth.getAsObject() );
				}
				resolve( rows );
			}
			else
			{
				var rows = [], filteredIds = [] ;
				var o ;
				var sth = self.sthNextItemsNext ;
			    sth.bind({$previousId:previousId});
				while( sth.step() )
				{
					o = sth.getAsObject();
			        rows.push( o );
			        filteredIds.push( o.id );
				}
				sth = self.sthNextItemsWithoutIds ;
				sth.bind({$filteredIds:filteredIds.join(',')});
				while( sth.step() )
				{
					o = sth.getAsObject();
					o.weight = 0 ;
			        rows.push( o );
				}
				resolve( rows );				
			}
		}
	)},

	init : function()
	{
		var self = this ;

		self.sthNextItemsFirst = self.db.prepare('SELECT * FROM items ORDER BY weight DESC' );

	    sql = 'SELECT i2.id, i2.label, i2.item_types_id, items_has_items.weight ';
	    sql+= ' FROM items i2' ;
	    sql+= ' LEFT JOIN items_has_items ON ( items_id_next = i2.id )' ;
	    sql+= ' LEFT JOIN items i1 ON ( items_id = i1.id )' ;
	    sql+= ' WHERE items_id = $previousId' ;
	    sql+= ' ORDER BY items_has_items.weight DESC, i2.label ASC' ;
	    self.sthNextItemsNext = self.db.prepare( sql );

	    self.sthNextItemsWithoutIds = self.db.prepare( 'SELECT * FROM items WHERE id NOT IN ( $filteredIds ) ORDER BY label ASC' );
		
	},

	create : function( sql )
	{
		this.db = new SQL.Database();
		this.db.run( sql );
		this.init(); 
	},

	loadFromBinString : function( str )
	{
		var l = str.length,
        arr = new Uint8Array(l);
		for (var i=0; i<l; i++)
			arr[i] = str.charCodeAt(i);
		this.db = new SQL.Database( arr );
		this.db.run( 'SELECT * FROM sqlite_master');
		this.init();
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
