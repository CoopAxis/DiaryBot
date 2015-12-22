/**
 * diaryIhm.js
 */

"use strict";

var DiaryIhm =
{
	ids :
	{
		loader : '#page-loader',
		btnDbCreate : '#btn-db-create',
		btnDbLoad : '#btn-db-load',
		btnDbSave : '#btn-db-save',
		doingList: '#doing-items-list',
		itemsList: '#next-items-list'
	},

	templates :
	{
	   	nextItem_high : $('#template-next-item-high').detach().removeAttr('id') ,
	    nextItem_low : $('#template-next-item-low').detach().removeAttr('id'),
	    doingItem : $('#template-doing-item').detach().removeAttr('id')
	},

	ihm : function( diaryControler )
	{
		this.diaryControler = diaryControler ;

		this.db = new DiaryIhm.db( this );
		this.doingList = new DiaryIhm.doingList( this );
		this.itemsList = new DiaryIhm.itemsList( this );

		this.loaderOn = false ;
		this.loader = function( show )
		{
			if( show )
			{
				if( this.loaderOn )
					console.log('WARNING: loader already ON');
				this.loaderOn = true ;
				$(DiaryIhm.ids.loader).show();
			}
			else
			{
				if( ! this.loaderOn )
					console.log('WARNING: loader already oFF');
				this.loaderOn = false ;
				$(DiaryIhm.ids.loader).hide();
			}
		}

	},

	db : function( ihm )
	{
		this.ihm = ihm ;

		// store a reference to this for use in event handler
		var self = this ;

		$(DiaryIhm.ids.btnDbCreate).click( function()
		{
			self.ihm.diaryControler.dbCreate();
		} );
		$(DiaryIhm.ids.btnDbLoad).click( function()
		{
			self.ihm.diaryControler.dbLoad();
		} );
		$(DiaryIhm.ids.btnDbSave).click( function()
		{
			self.ihm.diaryControler.dbSave();
		} );
	},

	doingList : function( ihm )
	{
		this.ihm = ihm ;
		var self = this ;

		this.removeAll = function()
		{
	    	$( DiaryIhm.ids.doingList + ' > li').remove();			
		}

		this.addItem = function( item )
		{
	    	var o = DiaryIhm.templates.doingItem.clone() ;
	    	$('span', o).html( item.label );
	    	o.prop('data-item', item );
	    	o.appendTo( DiaryIhm.ids.doingList );
	    	o.click( self.onItemClick );
		}

		this.lastItem = function()
		{
			var doingItems = $(DiaryIhm.ids.doingList +' > li');
			return $(doingItems[ doingItems.length - 1 ]).prop('data-item');	
		}

		this.isEmpty = function()
		{
			return $(DiaryIhm.ids.doingList +' > li').length == 0
				? true
				: false ;
		}

		this.onItemClick = function()
		{
			var item = $(this).prop('data-item') ;
			$(this).remove();
			self.ihm.diaryControler.removeDoingItem( item );
		}
	},

	itemsList : function( ihm )
	{
		this.ihm = ihm ;
		var self = this ;

		this.fill = function( items )
		{
			$( DiaryIhm.ids.itemsList + ' > li').remove();

			var o ;
			items.forEach(function( item, index, array )
			{
				//console.log( index, item.label, item.weight );

				// select the template for rendering item: high or low

				o = item.weight > 0
					? DiaryIhm.templates.nextItem_high.clone()
					: DiaryIhm.templates.nextItem_low.clone() ;

				// construct a GUI element to hold the item

				$('span', o).html(item.label );
				o.prop('data-item', item );
				o.click( self.onItemClick );
				o.appendTo( DiaryIhm.ids.itemsList );
			});

		}

		this.onItemClick = function()
		{
			var item = $(this).prop('data-item') ;
			self.ihm.diaryControler.addDoingItem( item );
		}

	}

}
