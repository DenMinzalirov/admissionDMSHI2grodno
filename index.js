var firebaseConfig = {
    apiKey: "AIzaSyCmano4v46wCw4o6o-ztW9a8ODu0cSqIR4",
    authDomain: "dmshi2.firebaseapp.com",
    databaseURL: "https://dmshi2.firebaseio.com",
    projectId: "dmshi2",
    storageBucket: "dmshi2.appspot.com",
    messagingSenderId: "941886133381",
    appId: "1:941886133381:web:91ae1e65b9f05f56db85ec"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
let base;


const myTable = document.querySelector('.myTable');

const generateTable = (data) => {
    // console.log(Object.entries(data));
    Object.entries(data).sort().reverse().map((el) => {
        // console.log(el);
        myTable.insertAdjacentHTML('afterbegin', `
    <tr class='${el[0]} ${el[1].hide}' name='${el[0]}'>
        <th scope="row">#</th>
        <td>${el[0]}</td>
        <td><button class="item" name='${el[0]}'>Создать документ Word</button></td>
        <td><button class="hidBtn" name='hide'>Спрятать</button></td>
    </tr>
    `)
        const item = document.querySelector('.item');
        item.addEventListener('click', (e) => {
            // console.log('click', e.target.name);
            generate(e.target.name)
        })
        const hidBtn = document.querySelector('.hidBtn');
        hidBtn.addEventListener('click', (e) => {
            // console.log('hide');
            console.log('click', e.target.parentElement.parentElement.getAttribute('name'));
            const row = e.target.parentElement.parentElement;
            row.classList.add('hiden');

            db.collection("admission").doc(e.target.parentElement.parentElement.getAttribute('name')).set({ hide: 'hiden' },
                { merge: true }
            )
        })
    });

};

function getBase() {
    db.collection("admission").get().then((querySnapshot) => {

        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            base = { ...base, [doc.id]: doc.data() }
        });

        // console.log('2', base);
        // console.log('keys', Object.keys(base));
        // console.log('values', Object.values(base));
        // console.log('Валерия', base[Object.keys(base)[0]]);
        generateTable(base);
    })

}

// function hide(e) {
//     // console.log('hide');
//     console.log('click', e.target.parentElement.parentElement.className);
//     // const row = e.target.parentElement.parentElement;
//     // row.classList.add('hiden');

//     // db.collection("admission").doc(`${item.lastName}.${item.firsName}.${item.yearBirth}`).set(item,
//     //     { merge: true }
//     //   )
// }

function showHiden() {

    const trRow = document.querySelectorAll('tr')
    trRow.forEach((el) => { el.classList.remove('hiden') });
    console.log(trRow, 'show')

}


function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}
function generate(item) {
    console.log('item', item);
    console.log('base', base[item]);
    loadFile("./zv.docx", function (error, content) {
        if (error) { throw error };
        var zip = new PizZip(content);
        var doc = new window.docxtemplater().loadZip(zip)
        doc.setData(base[item]);
        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        }
        catch (error) {
            // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
            function replaceErrors(key, value) {
                if (value instanceof Error) {
                    return Object.getOwnPropertyNames(value).reduce(function (error, key) {
                        error[key] = value[key];
                        return error;
                    }, {});
                }
                return value;
            }
            console.log(JSON.stringify({ error: error }, replaceErrors));

            if (error.properties && error.properties.errors instanceof Array) {
                const errorMessages = error.properties.errors.map(function (error) {
                    return error.properties.explanation;
                }).join("\n");
                console.log('errorMessages', errorMessages);
                // errorMessages is a humanly readable message looking like this :
                // 'The tag beginning with "foobar" is unopened'
            }
            throw error;
        }
        var out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }) //Output the document using Data-URI
        saveAs(out, `${item}.docx`)
    })
}
