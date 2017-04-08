import { Texture } from './Texture';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function ProgressiveTexture( size, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.generateMipmaps = false;
	this.premultiplyAlpha = false;

	this.size = size;
	this.dataSegment = this.size * 32 * 4;

	this.needsUpdate = true;

	this.data = new Uint8Array( this.size * this.size * 4 );
	this.dummyData = new Uint8Array( this.size * this.size * 4 );
	this.dataOffsetY = 0;

	for ( var i = 0; i < this.size * this.size * 4; ++i ) {
		
		this.data[ i ] = 255;
		this.dummyData[ i ] = 255;
	}

	this.image = { data: this.data, width: this.size, height: this.size };
	
	this.uploaded = false;

	this.busy = false;
}

function load( url, workerPath ) {

	this.initWorker( workerPath );
	this.url = url;
}

function setUploaded() {

	this.uploaded = true;
	this.data = null;

	this.xhr = new XMLHttpRequest();

	this.xhr.addEventListener( 'progress', this.onProgress.bind( this ), false );
	this.xhr.addEventListener( 'load', this.onLoad.bind( this ), false );

	this.xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );

	this.xhr.open( 'GET', this.url );
	this.xhr.send();

}

function initWorker( workerPath ) {

	this.worker = new Worker( workerPath );
	
	this.busy = false;

	var self = this;
	this.worker.onmessage = function( event ) {
	
		self.data = event.data;
		self.dataOffsetY = self.size - 32;
		self.busy = false;

	}

}

function onProgress( event ) {

	if ( !this.busy ) {

		var t = ( this.xhr.mozResponseArrayBuffer || this.xhr.mozResponse || this.xhr.responseArrayBuffer || this.xhr.response );

        if ( this.data == null || this.data.length == 0 ) {
            
            this.worker.postMessage = this.worker.webkitPostMessage || this.worker.postMessage;  
            this.worker.postMessage( t ); 
            this.busy = true;

        }

	}

}

function onLoad( event ) {

	var t = ( this.xhr.mozResponseArrayBuffer || this.xhr.mozResponse || this.xhr.responseArrayBuffer || this.xhr.response );

	this.worker.postMessage = this.worker.webkitPostMessage || this.worker.postMessage;  
    this.worker.postMessage( t ); 

}

ProgressiveTexture.prototype = Object.create( Texture.prototype );
ProgressiveTexture.prototype.constructor = ProgressiveTexture;
ProgressiveTexture.prototype.initWorker = initWorker;
ProgressiveTexture.prototype.onProgress = onProgress;
ProgressiveTexture.prototype.setUploaded = setUploaded;
ProgressiveTexture.prototype.onLoad = onLoad;
ProgressiveTexture.prototype.load = load;
ProgressiveTexture.prototype.isProgressiveTexture = true;

export { ProgressiveTexture };
