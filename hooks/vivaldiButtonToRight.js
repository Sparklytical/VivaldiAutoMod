(function () {

    function style() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.id = 'mvVivbtn';
        style.innerHTML = `.vivaldi {position: relative;}`;
        document.getElementsByTagName('head')[0].appendChild(style);
    };

    function mvVivbtn() {
        style();
        var btn = document.querySelector(".vivaldi");
        btn.setAttribute('tabindex', '-1');
        var bar = document.querySelector(".toolbar-addressbar");
        var div = document.createElement('div');
        setTimeout(wait, 300);
        div.classList.add('button-toolbar');
        bar.appendChild(div);
        div.appendChild(btn);
    }

    setTimeout(function wait() {
        const browser = document.getElementById('browser');
        if (browser) {
              mvVivbtn();
        }
        else {
             setTimeout(wait, 300);
        }
    });

    })();
