const KEY = 'delleDocesFinanceiro';
window.DELLE_DB_KEY = KEY;


/* =========================================================
   BANCO DE DADOS
========================================================= */

function createDefaultDelleDb() {
    return {
        products: [
            { id: 1, name: 'Bolo gelado', price: 15, cost: 6 },
            { id: 2, name: 'Bolo no pote', price: 15, cost: 7 },
            { id: 3, name: 'Bolo em pedaço', price: 12, cost: 5 }
        ],
        sales: [],
        expenses: []
    };
}

window.createDefaultDelleDb = createDefaultDelleDb;

let db =
    JSON.parse(localStorage.getItem(KEY) || 'null')
    ||
    createDefaultDelleDb();


window.db = db;

// Substitui o conteúdo local pelos dados recebidos da nuvem sem recarregar a página.
window.replaceDelleDb = function (remoteData) {
    db.products = Array.isArray(remoteData.products) ? remoteData.products : [];
    db.sales = Array.isArray(remoteData.sales) ? remoteData.sales : [];
    db.expenses = Array.isArray(remoteData.expenses) ? remoteData.expenses : [];
};


/* =========================================================
   FUNÇÕES BÁSICAS
========================================================= */

const $ = id =>
    document.getElementById(id);


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


const save = () => {
    localStorage.setItem(
        KEY,
        JSON.stringify(db)
    );

    // Sincroniza com o Firebase quando houver uma conta conectada.
    if (window.DelleFirebase && window.DelleFirebase.isReady()) {
        window.DelleFirebase.uploadCurrentData();
    }
};


/* =========================================================
   MESES
========================================================= */

function setup() {

    let now = new Date();

    let select = $('month');

    for (let i = 0; i < 12; i++) {

        let d =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );


        let value =
            d.toISOString().slice(0, 7);


        let option =
            document.createElement('option');


        option.value =
            value;


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


    select.onchange =
        render;
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
            x =>
                x.date &&
                x.date.slice(0, 7) === month()
        );


    let expenses =
        db.expenses.filter(
            x =>
                x.date &&
                x.date.slice(0, 7) === month()
        );


    let revenue =
        sales.reduce(
            (a, x) =>
                a + Number(x.value || 0),
            0
        );


    let expense =
        expenses.reduce(
            (a, x) =>
                a + Number(x.value || 0),
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
   QUANTIDADE TOTAL DE ITENS
========================================================= */

function getSaleItemsQty(sale) {

    /*
     * Venda nova
     */

    if (
        Array.isArray(sale.items)
    ) {

        return sale.items.reduce(
            (total, item) =>
                total +
                Number(item.qty || 0),
            0
        );

    }


    /*
     * Compatibilidade com
     * vendas antigas
     */

    return Number(
        sale.qty || 0
    );

}


function getTotalItems(sales) {

    return sales.reduce(
        (total, sale) =>
            total +
            getSaleItemsQty(sale),
        0
    );

}


/* =========================================================
   TEXTO DOS PRODUTOS
========================================================= */

function saleProductsText(sale) {

    /*
     * Venda nova
     */

    if (
        Array.isArray(sale.items)
    ) {

        return sale.items
            .map(item =>
                `${item.product} ×${item.qty}`
            )
            .join(', ');

    }


    /*
     * Venda antiga
     */

    return `${sale.product || 'Produto'} ×${sale.qty || 1}`;

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
        getTotalItems(t.s);


    $('margin').textContent =
        'Margem ' +
        margin.toFixed(1) +
        '%';


    $('summary').innerHTML =

        '<b>Faturamento:</b> ' +
        money(t.r) +

        '<br><b>Despesas:</b> ' +
        money(t.d) +

        '<br><b>Lucro:</b> ' +
        money(t.p) +

        '<br><b>Margem:</b> ' +
        margin.toFixed(1) +
        '%' +

        '<br><b>Pedidos:</b> ' +
        t.s.length;


    chart(t.s);

    tableSales(t.s);

    recent(t.s);

    products();

    expenses(t.e);

}

window.render = render;


/* =========================================================
   GRÁFICO
========================================================= */

function chart(s) {

    let [
        y,
        mo
    ] =
        month()
            .split('-')
            .map(Number);


    let days =
        new Date(
            y,
            mo,
            0
        ).getDate();


    let values =
        Array(days).fill(0);


    s.forEach(x => {

        let day =
            +x.date.slice(8) - 1;


        if (
            day >= 0 &&
            day < values.length
        ) {

            values[day] +=
                Number(x.value || 0);

        }

    });


    let max =
        Math.max(...values, 1);


    $('chart').innerHTML =

        values.map(
            (n, i) => `

                <div class="barwrap">

                    <span class="barvalue">

                        ${
                            n
                                ? money(n)
                                    .replace('R$', '')
                                : ''
                        }

                    </span>


                    <div
                        class="bar"
                        title="${money(n)}"
                        style="
                            height:
                            ${Math.max(
                                3,
                                n / max * 80
                            )}%
                        ">
                    </div>


                    <span class="barlabel">

                        ${i + 1}

                    </span>

                </div>

            `
        ).join('');

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

                    <th>Cliente</th>

                    <th>Produtos</th>

                    <th>Pagamento</th>

                    <th>Valor</th>

                    <th></th>

                </tr>


                ${

                    s
                        .slice()
                        .sort(
                            (a, b) =>
                                b.date.localeCompare(
                                    a.date
                                )
                        )
                        .map(
                            x => `

                                <tr>

                                    <td>

                                        ${
                                            x.date
                                                .split('-')
                                                .reverse()
                                                .join('/')
                                        }

                                    </td>


                                    <td>

                                        <strong>

                                            ${
                                                escapeHTML(
                                                    x.customer ||
                                                    'Cliente não informado'
                                                )
                                            }

                                        </strong>

                                    </td>


                                    <td>

                                        ${
                                            escapeHTML(
                                                saleProductsText(x)
                                            )
                                        }

                                    </td>


                                    <td>

                                        ${
                                            escapeHTML(
                                                x.payment || ''
                                            )
                                        }

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

                            `
                        )
                        .join('')

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
                    b.date.localeCompare(
                        a.date
                    )
            )
            .slice(0, 6);


    $('recent').innerHTML =

        a.length

            ?

            `

            <table>

                <tr>

                    <th>Data</th>

                    <th>Cliente</th>

                    <th>Produtos</th>

                    <th>Pagamento</th>

                    <th>Valor</th>

                </tr>


                ${

                    a.map(
                        x => `

                            <tr>

                                <td>

                                    ${
                                        x.date
                                            .split('-')
                                            .reverse()
                                            .join('/')
                                    }

                                </td>


                                <td>

                                    <strong>

                                        ${
                                            escapeHTML(
                                                x.customer ||
                                                'Cliente não informado'
                                            )
                                        }

                                    </strong>

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            saleProductsText(x)
                                        )
                                    }

                                </td>


                                <td>

                                    ${
                                        escapeHTML(
                                            x.payment || ''
                                        )
                                    }

                                </td>


                                <td>

                                    ${money(x.value)}

                                </td>

                            </tr>

                        `
                    ).join('')

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

        db.products.map(
            p => {

                let lucro =
                    Number(p.price) -
                    Number(p.cost);


                let margem =
                    p.price
                        ? 100 *
                          lucro /
                          p.price
                        : 0;


                return `

                    <div class="product">

                        <h4>

                            ${
                                escapeHTML(
                                    p.name
                                )
                            }

                        </h4>


                        <div class="prices">

                            <span>

                                Venda
                                ${money(p.price)}

                            </span>


                            <span>

                                Custo
                                ${money(p.cost)}

                            </span>

                        </div>


                        <div class="profit">

                            Lucro
                            ${money(lucro)}

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

            }
        ).join('');

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


    openModal(
        'productModal'
    );

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
            sale => {

                /*
                 * Venda nova
                 */

                if (
                    Array.isArray(
                        sale.items
                    )
                ) {

                    return sale.items.some(
                        item =>
                            Number(
                                item.productId
                            ) === Number(id)
                    );

                }


                /*
                 * Venda antiga
                 */

                return sale.product ===
                    product.name;

            }
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
                p =>
                    p.id !== id
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
                                b.date.localeCompare(
                                    a.date
                                )
                        )
                        .map(
                            x => `

                                <tr>

                                    <td>

                                        ${
                                            x.date
                                                .split('-')
                                                .reverse()
                                                .join('/')
                                        }

                                    </td>


                                    <td>

                                        <span class="tag">

                                            ${
                                                escapeHTML(
                                                    x.cat
                                                )
                                            }

                                        </span>

                                    </td>


                                    <td>

                                        ${
                                            escapeHTML(
                                                x.desc
                                            )
                                        }

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

                            `
                        )
                        .join('')

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
   SEGURANÇA DE TEXTO HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

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

    $('saleForm').reset();


    $('saleDate').value =
        today();


    $('saleCustomer').value =
        '';


    $('saleItems').innerHTML =
        '';


    $('saleValue').value =
        '0.00';


    $('saleTotalDisplay').textContent =
        money(0);


    /*
     * Adiciona automaticamente
     * o primeiro produto
     */

    addSaleItem();


    openModal(
        'saleModal'
    );

}


/* =========================================================
   ADICIONAR PRODUTO NA VENDA
========================================================= */

function addSaleItem(productId = null) {

    if (!db.products.length) {

        alert(
            'Cadastre pelo menos um produto antes de registrar uma venda.'
        );

        return;

    }


    const container =
        $('saleItems');


    const row =
        document.createElement(
            'div'
        );


    row.className =
        'sale-item';


    const options =
        db.products
            .map(
                p => `

                    <option
                        value="${p.id}"
                        ${
                            productId != null &&
                            Number(productId) === Number(p.id)
                                ? 'selected'
                                : ''
                        }>

                        ${escapeHTML(p.name)}
                        —
                        ${money(p.price)}

                    </option>

                `
            )
            .join('');


    row.innerHTML = `

        <select
            class="sale-item-product">

            ${options}

        </select>


        <input
            class="sale-item-qty"
            type="number"
            min="1"
            value="1">


        <span
            class="sale-item-total">

            ${money(
                getSelectedProductPrice(row)
            )}

        </span>


        <button
            type="button"
            class="remove-item"
            onclick="removeSaleItem(this)">

            ×

        </button>

    `;


    container.appendChild(row);


    const select =
        row.querySelector(
            '.sale-item-product'
        );


    const qty =
        row.querySelector(
            '.sale-item-qty'
        );


    select.addEventListener(
        'change',
        updateSaleTotal
    );


    qty.addEventListener(
        'input',
        updateSaleTotal
    );


    updateSaleTotal();

}


/* =========================================================
   PREÇO DO PRODUTO SELECIONADO
========================================================= */

function getSelectedProductPrice(row) {

    const select =
        row.querySelector(
            '.sale-item-product'
        );


    if (!select) return 0;


    const product =
        db.products.find(
            p =>
                Number(p.id) ===
                Number(select.value)
        );


    return product
        ? Number(product.price)
        : 0;

}


/* =========================================================
   REMOVER ITEM DA VENDA
========================================================= */

function removeSaleItem(button) {

    const row =
        button.closest(
            '.sale-item'
        );


    if (row) {

        row.remove();

    }


    /*
     * Se não sobrar nenhum,
     * adiciona outro automaticamente.
     */

    if (
        !$('saleItems')
            .querySelector(
                '.sale-item'
            )
    ) {

        addSaleItem();

    }


    updateSaleTotal();

}


/* =========================================================
   ATUALIZAR TOTAL DA VENDA
========================================================= */

function updateSaleTotal() {

    const rows =
        document.querySelectorAll(
            '#saleItems .sale-item'
        );


    let total = 0;


    rows.forEach(row => {

        const product =
            db.products.find(
                p =>
                    Number(p.id) ===
                    Number(
                        row.querySelector(
                            '.sale-item-product'
                        ).value
                    )
            );


        const qty =
            Number(
                row.querySelector(
                    '.sale-item-qty'
                ).value
            ) || 0;


        const itemTotal =
            product
                ? Number(product.price) * qty
                : 0;


        row.querySelector(
            '.sale-item-total'
        ).textContent =
            money(itemTotal);


        total +=
            itemTotal;

    });


    $('saleValue').value =
        total.toFixed(2);


    $('saleTotalDisplay').textContent =
        money(total);

}


/* =========================================================
   SALVAR VENDA
========================================================= */

$('saleForm').onsubmit = e => {

    e.preventDefault();


    const customer =
        $('saleCustomer')
            .value
            .trim();


    if (!customer) {

        alert(
            'Digite o nome do cliente.'
        );

        $('saleCustomer').focus();

        return;

    }


    const rows =
        document.querySelectorAll(
            '#saleItems .sale-item'
        );


    if (!rows.length) {

        alert(
            'Adicione pelo menos um produto à venda.'
        );

        return;

    }


    const items = [];


    let total = 0;


    rows.forEach(row => {

        const productId =
            Number(
                row.querySelector(
                    '.sale-item-product'
                ).value
            );


        const qty =
            Number(
                row.querySelector(
                    '.sale-item-qty'
                ).value
            );


        const product =
            db.products.find(
                p =>
                    Number(p.id) ===
                    productId
            );


        if (
            product &&
            qty > 0
        ) {

            const itemTotal =
                Number(product.price) *
                qty;


            items.push({

                productId:
                    product.id,

                product:
                    product.name,

                qty:
                    qty,

                price:
                    Number(product.price),

                cost:
                    Number(product.cost),

                total:
                    itemTotal

            });


            total +=
                itemTotal;

        }

    });


    if (!items.length) {

        alert(
            'Adicione pelo menos um produto válido.'
        );

        return;

    }


    db.sales.push({

        id:
            Date.now(),

        date:
            $('saleDate').value,

        customer:
            customer,

        items:
            items,

        value:
            total,

        payment:
            $('salePayment').value

    });


    save();


    closeModal(
        'saleModal'
    );


    render();

};


/* =========================================================
   NOVO PRODUTO
========================================================= */

function openProduct() {

    $('productForm').reset();


    delete
        $('productForm')
            .dataset
            .editId;


    $('productModal')
        .querySelector('h3')
        .textContent =
        'Novo produto';


    openModal(
        'productModal'
    );

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
        $('prodName')
            .value
            .trim();


    const price =
        Number(
            $('prodPrice').value
        );


    const cost =
        Number(
            $('prodCost').value
        );


    if (!name) {

        alert(
            'Digite o nome do produto.'
        );

        return;

    }


    if (
        price < 0 ||
        cost < 0
    ) {

        alert(
            'Preço e custo não podem ser negativos.'
        );

        return;

    }


    /*
     * EDITAR
     */

    if (editId) {

        const product =
            db.products.find(
                p =>
                    p.id === editId
            );


        if (product) {

            /*
             * IMPORTANTE:
             *
             * Não alteramos vendas antigas.
             *
             * Cada item da venda guarda
             * seu próprio nome, preço e custo.
             */

            product.name =
                name;


            product.price =
                price;


            product.cost =
                cost;

        }


        delete
            e.target.dataset.editId;


        $('productModal')
            .querySelector('h3')
            .textContent =
            'Novo produto';

    }


    /*
     * NOVO
     */

    else {

        db.products.push({

            id:
                Date.now(),

            name:
                name,

            price:
                price,

            cost:
                cost

        });

    }


    save();


    closeModal(
        'productModal'
    );


    e.target.reset();


    render();

};


/* =========================================================
   NOVA DESPESA
========================================================= */

function openExpense() {

    $('expenseForm').reset();


    $('expDate').value =
        today();


    openModal(
        'expenseModal'
    );

}


/* =========================================================
   SALVAR DESPESA
========================================================= */

$('expenseForm').onsubmit = e => {

    e.preventDefault();


    const value =
        Number(
            $('expValue').value
        );


    if (value < 0) {

        alert(
            'O valor não pode ser negativo.'
        );

        return;

    }


    db.expenses.push({

        id:
            Date.now(),

        date:
            $('expDate').value,

        cat:
            $('expCat').value,

        desc:
            $('expDesc')
                .value
                .trim(),

        value:
            value

    });


    save();


    closeModal(
        'expenseModal'
    );


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
                x =>
                    x.id !== id
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
                .forEach(
                    x =>
                        x.classList.remove(
                            'active'
                        )
                );


            button.classList.add(
                'active'
            );


            document
                .querySelectorAll('.section')
                .forEach(
                    x =>
                        x.classList.remove(
                            'active'
                        )
                );


            $(
                button.dataset.s
            ).classList.add(
                'active'
            );


            $('pageTitle')
                .textContent =

                {

                    dashboard:
                        'Visão geral',

                    vendas:
                        'Vendas',

                    produtos:
                        'Produtos',

                    despesas:
                        'Despesas'

                }[
                    button.dataset.s
                ];

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

                if (
                    e.target === modal
                ) {

                    modal.classList.remove(
                        'show'
                    );

                }

            }
        );

    });


/* =========================================================
   INICIAR
========================================================= */

setup();

render();

if (window.DelleFirebase) {
    window.DelleFirebase.init();
}