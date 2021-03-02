export class Database {
    constructor() {

    }

    /**
     * Add labeled Handpose data to IndexedDb
     * @param {array} labeledData 
     */
    async addData(labeledData){
        return new Promise((resolve, reject) => {
            console.log(resolve)
            labeledData.forEach(object => {
                localforage.setItem(object.label, object.data)
                    .then(()    => { resolve() })
                    .catch((e)  => { console.log(e) })
            })
        })
    }

    /**
     * Clears all db entries (keys) in IndexedDb
     */
    clear() {
        return new Promise((resolve, reject) => {
            localforage.clear().then(function() {
                // Run this code once the database has been entirely deleted.
                console.log('Database is now empty.')
                resolve()
            }).catch((err) => {
                // This code runs if there were any errors
                console.log(err)
                reject()
            });
        })
    }

    /**
     * Get all data objects for all keys
     */
    getData() {
        return localforage.keys()
            .then(keys => {
                return Promise.all(keys.map(key => {
                    return localforage.getItem(key)
                        .then(value => {
                            return {'label' : key, 'data' : value};
                        })
                        .catch(error =>
                            console.log(error)
                        )
                }));
            });
    }
}