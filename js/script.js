/* DECLARACIONES */

let productosSeleccionados = JSON.parse(localStorage.getItem("productoSeleccinados")) || [];
let ultimaCompra = localStorage.getItem("ultimaCompra") || '0';
let catalogoProductos=[];

const botonCarrito = document.querySelector('#btnCarrito');
const botonComprar = document.querySelector('#btnComprar');
const contenedorCarrito = document.querySelector('#carrito');
const item = document.querySelector('.item');
const catalogo = document.querySelector('#catalogo');
const cantidadProductosAComprar = document.querySelector('#cantidad-productos-a-comprar');
const carritoVacio = document.querySelector('#carrito-vacio');
const totalCompra = document.querySelector('#total-compra');
const totalPagar = document.querySelector('#pagar');
botonCarrito.addEventListener('click', () => {contenedorCarrito.classList.toggle('ocultar-carrito');});
botonComprar.addEventListener('click', () => {comprarProductos();});

/* FUNCIONES */

const mostrarCatalogo=(parametro_productos)=>{
	catalogo.innerHTML="";
	parametro_productos.forEach((producto)=>{
		let div_producto = document.createElement("div");
		div_producto.classList.add("producto");
		div_producto.innerHTML=`
			<figure>
				<img src="${producto.img}" alt="producto">
			</figure>
			<div class="datos">
				<p class="codigo">${producto.codigo}</p>
				<h2 class="nombre">${producto.nombre}</h2>
				<p class="precio">$ ${producto.precio}</p>
				<button class="btn-agregar">Agregar al Carro</button>
			</div>`;
		catalogo.append(div_producto);
	})
}
const actualizarCarrito = () => {
	if (productosSeleccionados.length) {
		item.classList.remove('ocultar');
		totalCompra.classList.remove('ocultar');
		carritoVacio.classList.add('ocultar');
	} else {
		item.classList.add('ocultar');
		totalCompra.classList.add('ocultar');
		carritoVacio.classList.remove('ocultar');
	}

	item.innerHTML = '';
	let total = 0;
	let totalProductos = 0;

	productosSeleccionados.forEach(producto => {
		const contenedorProducto = document.createElement('div');
		contenedorProducto.classList.add('item-producto');

		contenedorProducto.innerHTML = `
            <div class="datos">
                <span class="cantidad">${producto.cantidad}</span>
				<p class="codigo">${producto.codigo}</p>
                <p class="nombre">${producto.nombre}</p>
                <span class="precio">${producto.precio}</span>
            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="btn-eliminar"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        `;

		item.append(contenedorProducto);

		total = total + parseFloat(producto.cantidad * producto.precio.slice(1));
		totalProductos = totalProductos + producto.cantidad;
	});
	localStorage.setItem("productoSeleccinados", JSON.stringify(productosSeleccionados));
	totalPagar.innerText = `$ ${total}`;
	cantidadProductosAComprar.innerText = totalProductos;
};
const comprarProductos=()=>{

	(async () => {
		const inputValue = "";
		const { value: nombre } = await Swal.fire({
		  input: "text",
		  inputLabel: "Ingrese su Nombre",
		  inputValue,
		  showCancelButton: true,
		  confirmButtonText: "Confirmar Compra",
		  cancelButtonText: "Cancelar",
		  inputValidator: (value) => {
			if (!value) {
			  return "Falta Ingresar su nombre!";
			}
		  }
		});
		if (nombre) {
			ultimaCompra	=	(parseInt(ultimaCompra) + 1).toString();
			localStorage.setItem("ultimaCompra", ultimaCompra);

			let Datetime = luxon.DateTime;
			const hoy=Datetime.now();
			
			productosSeleccionados.splice(0);
			actualizarCarrito();
			Swal.fire({
				title: "¡Gracias por tu compra!",
				html: `<h4>Orden de Compra N°: 0001-${ultimaCompra}</h4><p>=================================</p><p>${nombre}</p><p>${hoy.toFormat('DDDD')}</p>`,
				icon: "success"
			  });
		}
	})()		
}

/* EVENTOS */

catalogo.addEventListener('click', e => {
	if (e.target.classList.contains('btn-agregar')) {
		const producto = e.target.parentElement;

		const datosProductoSeleccionado = {
			codigo: producto.querySelector('.codigo').textContent,
			nombre: producto.querySelector('.nombre').textContent,
			precio: producto.querySelector('.precio').textContent,
			cantidad: 1,
		};

		const productoEncontrado = productosSeleccionados.some(
			producto => producto.codigo === datosProductoSeleccionado.codigo
		);

		if (productoEncontrado) {
			const productos = productosSeleccionados.map(producto => {
				if (producto.codigo === datosProductoSeleccionado.codigo) {
					producto.cantidad++;
					return producto;
				} else {
					return producto;
				}
			});
			productosSeleccionados = [...productos];
		} else {
			productosSeleccionados = [...productosSeleccionados, datosProductoSeleccionado];
		}
		actualizarCarrito();

		Toastify({
			text: `${datosProductoSeleccionado.nombre} | agregado al carrito`,
			duration: 5000,
			style:{
				background: "linear-gradient(to right, rgb(245, 230, 97), rgb(255, 255, 255))",
				color: "rgb(0,0,0)",
				borderRadius: "20px"
			}	
			}).showToast();
	}
});

item.addEventListener('click', e => {

	if (e.target.classList.contains('btn-eliminar')) {
		let producto = e.target.parentElement;
		let codigo = producto.querySelector('.codigo').textContent;
		let nombre = producto.querySelector('.nombre').textContent;
		
		Swal.fire({
			title: "Estas seguro de ELIMINAR?",
			text: `Item: ${nombre}`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Si, Eliminar!",
			cancelButtonText: "Cancelar"
		  }).then((result) => {
			if (result.isConfirmed) {
				const posicionItem = productosSeleccionados.findIndex(itemProducto=>itemProducto.codigo===codigo);
				productosSeleccionados.splice(posicionItem,1);
				actualizarCarrito();
				
				Swal.fire({
					title: "Eliminado!",
					text: "El item ha sido eliminado.",
					icon: "success"
			  	});
			}
		  });
	}
});

/* INICIO */

fetch('./datos/producto.json')
	.then((res) => res.json())
	.then((data) => {
		catalogoProductos = [...data];
		mostrarCatalogo(catalogoProductos);
	})

actualizarCarrito();
