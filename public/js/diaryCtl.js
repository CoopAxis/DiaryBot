/**
 * diaryCtl.js
 */

"use strict";

function DiaryCtl()
{
	this.ihm = new DiaryIhm.ihm( this ) ;

	// store a reference to this for use in event handler
	var self = this ;

    this.storyReset = function()
    {
		console.log('DiaryCtl.storyReset()');

		this.ihm.doingList.removeAll();
    	this.ihm.itemsList.fill( diaryBot.nextItems() );
    },

    this.addDoingItem = function( item )
    {
		console.log('DiaryCtl.addDoingItem()');

		// Add a link between items

    	var lastDoingItem = this.ihm.doingList.lastItem();
    	if( lastDoingItem == null )
    		diaryBot.linkItem( item );
    	else
    		diaryBot.linkItem( lastDoingItem, item );

    	// Update IHM

    	this.ihm.doingList.addItem( item );
    	this.ihm.itemsList.fill( diaryBot.nextItems( item.id ) );
    }

    this.removeDoingItem = function( item )
    {
    	var lastDoingItem = this.ihm.doingList.lastItem();
    	if( lastDoingItem == null )
    		this.ihm.itemsList.fill( diaryBot.nextItems() );
    	else
    		this.ihm.itemsList.fill( diaryBot.nextItems( lastDoingItem.id ) );
    }

	this.dbCreate = function()
	{
		console.log('DiaryCtl.dbCreate()');

		this.ihm.loader( true );

		jQuery.ajax('js/schema.txt')
		.done( function( data, textStatus, jqXHR )
		{
			diaryBot.create( data );
			self.storyReset();
		})
		.fail( function( jqXHR, textStatus, error )
		{
			
		})
		.always(function()
		{
			self.ihm.loader( false );
		});

	},

	this.dbLoad = function()
	{
		console.log('DiaryCtl.dbLoad()');

		this.ihm.loader( true );

		var p = new Promise(function( resolve, reject )
	   	{
	    	diaryBot.loadFromBinString( localStorage.getItem( 'diaryBotDb' ) );
			self.storyReset();
	    	resolve();
		});
		p.then(function()
		{
			self.ihm.loader( false );
		});
	},

	this.dbSave = function()
	{
		console.log('DiaryCtl.dbSave()');

		self.ihm.loader( true );
	
		var p = new Promise(function( resolve, reject )
		{
	    	window.localStorage.setItem( 'diaryBotDb', diaryBot.toBinString() );
	    	resolve();
		});
		p.then(function()
		{
			self.ihm.loader( false );
		});
	
	}

}
