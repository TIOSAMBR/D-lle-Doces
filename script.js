const KEY = 'delleDocesFinanceiro';


/* =========================================================
   BANCO DE DADOS
========================================================= */

let db =
    JSON.parse(localStorage.getItem(KEY) || 'null')
    ||
    {
        products: [
            {
                id: 1,
                name: 'Bolo gelado',
                price: 15,
                cost: 6
            },
            {
                id: 2,
                name: 'Bolo no pote',
                price: 15,
                cost: 7
            },
            {
                id: 3,
                name: 'Bolo em pedaço',
                price: 12,
                cost: 5
            }
        ],

        sales: [],

        expenses: []
    };


/* =========================================================
   FUNÇÕES BÁSICAS
========================================================= */

const $ = id => document.getElementById(id);

const money = n =>
    Number(n || 0).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );

const today = () =>
    new Date().toISOString().slice(0, 10);

const save = () =>
    localStorage.setItem(KEY, JSON.stringify(db));


/* =========================================================
   MESES
========================================================= */

function setup() {

    let now = new Date();

    let select = $('month');

    for (let i = 0; i < 12; i++) {

        let d = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        let value =
            d.toISOString().slice(0, 7);

        let option =
            document.createElement('option');

        option.value = value;

        option.textContent =
            d.toLocaleDateString(
                'pt-BR',
                {
                    month: 'long',
                    year: 'numeric'
                }
            );

        select.appendChild(option);
    }

    select.value =
        now.toISOString().slice(0, 7);

    select.onchange = render;
}


function month() {

    return $('month').value;

}


/* =========================================================
   DADOS DO MÊS
========================================================= */

function T() {

    let sales =
        db.sales.filter(
            x => x.date.slice(0, 7) == month()
        );

    let expenses =
        db.expenses.filter(
            x => x.date.slice(0, 7) == month()
        );

    let revenue =
        sales.reduce(
            (a, x) => a + Number(x.value),
            0
        );

    let expense =
        expenses.reduce(
            (a, x) => a + Number(x.value),
            0
        );

    return {
        s: sales,
        e: expenses,
        r: revenue,
        d: expense,
        p: revenue - expense
    };
}


/* =========================================================
   RENDER
========================================================= */

function render() {

    let t = T();

    let margin =
        t.r
            ? 100 * t.p / t.r
            : 0;


    $('revenue').textContent =
        money(t.r);

    $('expenses').textContent =
        money(t.d);

    $('profit').textContent =
        money(t.p);

    $('profit').className =
        t.p >= 0
            ? 'positive'
            : 'negative';


    $('items').textContent =
        t.s.reduce(
            (a, x) => a + Number(x.qty),
            0
        );


    $('margin').textContent =
        'Margem ' + margin.toFixed(1) + '%';


    $('summary').innerHTML =
        '<b>Faturamento:</b> ' + money(t.r) +
        '<br><b>Despesas:</b> ' + money(t.d) +
        '<br><b>Lucro:</b> ' + money(t.p) +
        '<br><b>Margem:</b> ' + margin.toFixed(1) + '%' +
        '<br><b>Pedidos:</b> ' + t.s.length;


    chart(t.s);

    tableSales(t.s);

    recent(t.s);

    products();

    expenses(t.e);
}


/* =========================================================
   GRÁFICO
========================================================= */

function chart(s) {

    let [y, mo] =
        month().split('-').map(Number);

    let days =
        new Date(y, mo, 0).getDate();

    let values =
        Array(days).fill(0);


    s.forEach(x => {

        let day =
            +x.date.slice(8) - 1;

        values[day] += Number(x.value);

    });


    let max =
        Math.max(...values, 1);


    $('chart').innerHTML =
        values.map((n, i) => `

            <div class="barwrap">

                <span class="barvalue">

                    ${n
                        ? money(n).replace('R$', '')
                        : ''
                    }

                </span>

                <div
                    class="bar"
                    title="${money(n)}"
                    style="
                        height:${Math.max(
                            3,
                            n / max * 80
                        )}%
                    ">
                </div>

                <span class="barlabel">
                    ${i + 1}
                </span>

            </div>

        `).join('');
}


/* =========================================================
   TABELA DE VENDAS
========================================================= */

function tableSales(s) {

    $('salesTable').innerHTML =
        s.length

            ?

            `
            <table>

                <tr>

                    <th>Data</th>
                    <th>Produto</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th></th>

                </tr>

                ${

                    s
                        .slice()
                        .sort(
                            (a, b) =>
                                b.date.localeCompare(a.date)
                        )
                        .map(x => `

                            <tr>

                                <td>
                                    ${x.date
                                        .split('-')
                                        .reverse()
                                        .join('/')
                                    }
                                </td>

                                <td>

                                    <strong>
                                        ${x.product}
                                    </strong>

                                    ×${x.qty}

                                </td>

                                <td>
                                    ${x.payment}
                                </td>

                                <td>
                                    ${money(x.value)}
                                </td>

                                <td>

                                    <button
                                        class="btn danger"
                                        onclick="del('sales', ${x.id})">

                                        Excluir

                                    </button>

                                </td>

                            </tr>

                        `).join('')

                }

            </table>
            `

            :

            `
            <div class="empty">
                Nenhuma venda neste mês.
            </div>
            `;
}


/* =========================================================
   VENDAS RECENTES
========================================================= */

function recent(s) {

    let a =
        s
            .slice()
            .sort(
                (a, b) =>
                    b.date.localeCompare(a.date)
            )
            .slice(0, 6);


    $('recent').innerHTML =
        a.length

            ?

            `
            <table>

                <tr>

                    <th>Data</th>
                    <th>Produto</th>
                    <th>Pagamento</th>
                    <th>Valor</th>

                </tr>

                ${

                    a.map(x => `

                        <tr>

                            <td>
                                ${x.date
                                    .split('-')
                                    .reverse()
                                    .join('/')
                                }
                            </td>

                            <td>

                                <strong>
                                    ${x.product}
                                </strong>

                                ×${x.qty}

                            </td>

                            <td>
                                ${x.payment}
                            </td>

                            <td>
                                ${money(x.value)}
                            </td>

                        </tr>

                    `).join('')

                }

            </table>
            `

            :

            `
            <div class="empty">
                Nenhuma venda neste mês.
            </div>
            `;
}


/* =========================================================
   PRODUTOS
========================================================= */

function products() {

    $('productGrid').innerHTML =

        db.products.map(p => {

            let lucro =
                Number(p.price) -
                Number(p.cost);

            let margem =
                p.price
                    ? 100 * lucro / p.price
                    : 0;


            return `

                <div class="product">

                    <h4>
                        ${p.name}
                    </h4>


                    <div class="prices">

                        <span>
                            Venda ${money(p.price)}
                        </span>

                        <span>
                            Custo ${money(p.cost)}
                        </span>

                    </div>


                    <div class="profit">

                        Lucro ${money(lucro)}
                        •
                        ${margem.toFixed(1)}%

                    </div>


                    <div class="product-actions">

                        <button
                            class="btn soft"
                            onclick="editProduct(${p.id})">

                            ✏️ Editar

                        </button>


                        <button
                            class="btn danger"
                            onclick="delProduct(${p.id})">

                            🗑️ Remover

                        </button>

                    </div>

                </div>

            `;

        }).join('');
}


/* =========================================================
   EDITAR PRODUTO
========================================================= */

function editProduct(id) {

    const product =
        db.products.find(
            p => p.id === id
        );


    if (!product) return;


    $('prodName').value =
        product.name;

    $('prodPrice').value =
        product.price;

    $('prodCost').value =
        product.cost;


    $('productForm').dataset.editId =
        id;


    $('productModal')
        .querySelector('h3')
        .textContent =
        'Editar produto';


    openModal('productModal');
}


/* =========================================================
   REMOVER PRODUTO
========================================================= */

function delProduct(id) {

    const product =
        db.products.find(
            p => p.id === id
        );


    if (!product) return;


    const hasSales =
        db.sales.some(
            x => x.product === product.name
        );


    let message =
        `Deseja realmente remover o produto "${product.name}"?`;


    if (hasSales) {

        message +=
            `\n\n⚠️ Este produto possui vendas registradas.` +
            `\n\nAs vendas antigas serão mantidas,` +
            ` mas o produto não poderá mais ser` +
            ` selecionado em novas vendas.`;
    }


    if (confirm(message)) {

        db.products =
            db.products.filter(
                p => p.id !== id
            );


        save();

        render();
    }
}


/* =========================================================
   DESPESAS
========================================================= */

function expenses(e) {

    $('expenseTable').innerHTML =
        e.length

            ?

            `
            <table>

                <tr>

                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th></th>

                </tr>

                ${

                    e
                        .slice()
                        .sort(
                            (a, b) =>
                                b.date.localeCompare(a.date)
                        )
                        .map(x => `

                            <tr>

                                <td>
                                    ${x.date
                                        .split('-')
                                        .reverse()
                                        .join('/')
                                    }
                                </td>

                                <td>

                                    <span class="tag">
                                        ${x.cat}
                                    </span>

                                </td>

                                <td>
                                    ${x.desc}
                                </td>

                                <td>
                                    ${money(x.value)}
                                </td>

                                <td>

                                    <button
                                        class="btn danger"
                                        onclick="del('expenses', ${x.id})">

                                        Excluir

                                    </button>

                                </td>

                            </tr>

                        `).join('')

                }

            </table>
            `

            :

            `
            <div class="empty">
                Nenhuma despesa neste mês.
            </div>
            `;
}


/* =========================================================
   MODAIS
========================================================= */

function openModal(id) {

    $(id).classList.add('show');

}


function closeModal(id) {

    $(id).classList.remove('show');

}


/* =========================================================
   NOVA VENDA
========================================================= */

function openSale() {

    let select =
        $('saleProduct');


    select.innerHTML =
        db.products.map(p => `

            <option value="${p.id}">

                ${p.name}
                —
                ${money(p.price)}

            </option>

        `).join('');


    $('saleDate').value =
        today();

    $('saleQty').value =
        1;


    updateValue();

    openModal('saleModal');
}


function updateValue() {

    let product =
        db.products.find(
            p =>
                p.id ==
                $('saleProduct').value
        );


    let qty =
        +$('saleQty').value || 1;


    if (product) {

        $('saleValue').value =
            (
                product.price * qty
            ).toFixed(2);

    }
}


$('saleProduct').onchange =
    updateValue;

$('saleQty').oninput =
    updateValue;


/* =========================================================
   SALVAR VENDA
========================================================= */

$('saleForm').onsubmit = e => {

    e.preventDefault();


    let product =
        db.products.find(
            p =>
                p.id ==
                $('saleProduct').value
        );


    if (!product) {

        alert(
            'Cadastre pelo menos um produto antes de registrar uma venda.'
        );

        return;
    }


    db.sales.push({

        id: Date.now(),

        date: $('saleDate').value,

        product: product.name,

        qty: +$('saleQty').value,

        value: +$('saleValue').value,

        payment: $('salePayment').value

    });


    save();

    closeModal('saleModal');

    render();
};


/* =========================================================
   NOVO PRODUTO
========================================================= */

function openProduct() {

    $('productForm').reset();

    delete $('productForm').dataset.editId;


    $('productModal')
        .querySelector('h3')
        .textContent =
        'Novo produto';


    openModal('productModal');
}


/* =========================================================
   SALVAR / EDITAR PRODUTO
========================================================= */

$('productForm').onsubmit = e => {

    e.preventDefault();


    const editId =
        Number(
            e.target.dataset.editId
        );


    const name =
        $('prodName').value.trim();

    const price =
        +$('prodPrice').value;

    const cost =
        +$('prodCost').value;


    if (!name) {

        alert(
            'Digite o nome do produto.'
        );

        return;
    }


    if (price < 0 || cost < 0) {

        alert(
            'Preço e custo não podem ser negativos.'
        );

        return;
    }


    /* EDITAR */

    if (editId) {

        const product =
            db.products.find(
                p => p.id === editId
            );


        if (product) {

            const oldName =
                product.name;


            product.name =
                name;

            product.price =
                price;

            product.cost =
                cost;


            /*
             * Atualiza o nome nas vendas antigas.
             */
            db.sales.forEach(sale => {

                if (sale.product === oldName) {

                    sale.product =
                        name;

                }

            });
        }


        delete e.target.dataset.editId;


        $('productModal')
            .querySelector('h3')
            .textContent =
            'Novo produto';
    }


    /* NOVO */

    else {

        db.products.push({

            id: Date.now(),

            name: name,

            price: price,

            cost: cost

        });
    }


    save();

    closeModal('productModal');

    e.target.reset();

    render();
};


/* =========================================================
   NOVA DESPESA
========================================================= */

function openExpense() {

    $('expDate').value =
        today();

    openModal('expenseModal');
}


/* =========================================================
   SALVAR DESPESA
========================================================= */

$('expenseForm').onsubmit = e => {

    e.preventDefault();


    db.expenses.push({

        id: Date.now(),

        date: $('expDate').value,

        cat: $('expCat').value,

        desc: $('expDesc').value,

        value: +$('expValue').value

    });


    save();

    closeModal('expenseModal');

    e.target.reset();

    render();
};


/* =========================================================
   EXCLUIR VENDA / DESPESA
========================================================= */

function del(type, id) {

    if (
        confirm(
            'Excluir este registro?'
        )
    ) {

        db[type] =
            db[type].filter(
                x => x.id !== id
            );


        save();

        render();
    }
}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

document
    .querySelectorAll('.nav')
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll('.nav')
                .forEach(x =>
                    x.classList.remove('active')
                );


            button.classList.add('active');


            document
                .querySelectorAll('.section')
                .forEach(x =>
                    x.classList.remove('active')
                );


            $(button.dataset.s)
                .classList.add('active');


            $('pageTitle').textContent =
                {
                    dashboard: 'Visão geral',
                    vendas: 'Vendas',
                    produtos: 'Produtos',
                    despesas: 'Despesas'
                }[button.dataset.s];

        };

    });


/* =========================================================
   FECHAR MODAL AO CLICAR FORA
========================================================= */

document
    .querySelectorAll('.modal')
    .forEach(modal => {

        modal.addEventListener(
            'click',
            e => {

                if (e.target === modal) {

                    modal.classList.remove('show');

                }

            }
        );

    });


/* =========================================================
   INICIAR SISTEMA
========================================================= */

setup();

render();