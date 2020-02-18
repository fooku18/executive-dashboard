self.importScripts&&self.importScripts('/static/executive/cryptojs.js');

const DB_NAME = "apiCache";
const STORAGE_NAME = "responses";
const RETRY = 300;

;(function(){
    const request = self.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = e => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains(STORAGE_NAME))
            db.createObjectStore(STORAGE_NAME);
    }
    request.onsuccess = e => {
        const db = e.target.result;
        const transaction = db.transaction([STORAGE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORAGE_NAME);
        
        const objectStoreRequest = objectStore.get("nextPurge");
        objectStoreRequest.onsuccess = e => {
            const result = e.target.result;
            if(result){
                if(new Date() > new Date(result)){
                    const objectStoreRequestClear = objectStore.clear();
                    objectStoreRequestClear.onsuccess = e => {
                        console.warn("Cleared object store '" + STORAGE_NAME + "'");
                    }
                    const now = new Date();
                    now.setDate(now.getDate() + 7);
                    const objectStoreRequest = objectStore.put(now.toISOString(), "nextPurge");
                }
            }else{
                const now = new Date();
                now.setDate(now.getDate() + 7);
                const objectStoreRequest = objectStore.put(now.toISOString(), "nextPurge");
            }
        }
    }
}());

self.addEventListener("fetch", function(event) {
    if(self.indexedDB && event.request.method === "POST" && event.request.url.search(/\/api/)){
        event.respondWith(
            getCache(event.request)
        );
    }
})

async function getCache(request){
    const requestClone = request.clone();
    const api = request.url.match(/\/api\/(.*)$/);
    let cachedResponse;
    let key;
    if(api){
        const json = await(request.json());
        key = CryptoJS.MD5(JSON.stringify(json)).toString();
        cachedResponse = await checkInCache(key);
    }else{
        return fetch(requestClone);
    }
    return cachedResponse&&(parseInt(((new Date() - new Date(cachedResponse.timestamp))/1000)/60) <= RETRY) ? new Response(JSON.stringify(cachedResponse.response)) : fetch(requestClone).then(async response => {
        const responseClone = response.clone();
        const json = await response.json();
        setCache(key, json);
        return responseClone;
    }).catch(e => console.log(e));
}

function setCache(key, val){
    let db;
    const request = self.indexedDB.open(DB_NAME);
    request.onsuccess = e => {
        db = e.target.result;
        let transaction;
        let objectStore;
        try{
            transaction = db.transaction([STORAGE_NAME], "readwrite");
            objectStore = transaction.objectStore(STORAGE_NAME);
            const value = {
                timestamp: new Date().toISOString(),
                response: val
            }
            objectStore.put(value, key);
        }catch(e){
        }
    }
}

function checkInCache(key){
    return new Promise((res, rej) => {
        let db;
        const request = self.indexedDB.open(DB_NAME);
        request.onsuccess = e => {
            db = e.target.result;
            db.onerror = e => {
                return rej();
            }
            let transaction;
            let objectStore;
            try{
                transaction = db.transaction([STORAGE_NAME], "readonly");
                objectStore = transaction.objectStore(STORAGE_NAME);
            }catch(e){
                return rej();
            }
            const result = objectStore.get(key);
            result.onsuccess = e => {
                return res(e.target.result);
            }
            result.onerror = e => {
                return rej();
            }
        }
    })
}