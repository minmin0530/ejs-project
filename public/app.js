window.onload = function() {
    console.log(1);
    if (navigator.serviceWorker) {
        console.log(2);
        navigator.serviceWorker
           .register('/sw.js')
           .then((registration) => { // 登録成功
             console.log('scope:', registration.scope);
           })
           .catch((error) => { // 登録失敗
             console.log('failed: ', error);
           });

           document.getElementById('fetch_button').addEventListener('click', function() {
                 fetch("https://bigaru.com/img")
                 .then(respons => {
                     console.log(respons);
                     return respons.blob(); // バイナリデータとする？
                 }).then(blob =>{
                     console.log(blob);
                     return URL.createObjectURL(blob); // Data URI発行
                 }).then(dataUri =>{
                     console.log(dataUri);
                     document.getElementById("img").src = dataUri;
                     document.getElementById("err").innerHTML = "";
                 }).catch((err) => {
                     document.getElementById("err").innerHTML = "エラーです";
                 });
           });
           document.getElementById('clear_cache').addEventListener('click', function() {
            console.log("clear_cache");
            if (navigator.serviceWorker) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  });
                  caches.keys().then(function(keys) {
                    let promises = [];
                    keys.forEach(function(cacheName) {
                      if (cacheName) {
                        promises.push(caches.delete(cacheName));
                      }
                    });
                  });
            }
        });

    }
}

