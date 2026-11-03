// Получаем модальное окно по id.
// На страницах без модального окна (например, order.html) здесь будет null.
const orderDialog = document.getElementById('order-dialog');

// Получаем все кнопки заказа в карточках товаров.
const orderButtons = document.querySelectorAll('.product-card__button');

// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');

// Получаем скрытое поле, в которое будет записан выбранный товар.
const selectedProductInput = document.getElementById('selected-product');

// Модальное окно есть только на главной странице,
// поэтому его обработчики подключаем, только если оно найдено.
if (orderDialog) {
  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Получаем название товара из data-атрибута.
      const productName = button.dataset.product;

      // Записываем название товара в скрытое поле формы.
      selectedProductInput.value = productName;

      // Открываем модальное окно.
      orderDialog.showModal();
    });
  });

  // Закрываем модальное окно по кнопке «Закрыть».
  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });
}

// Получаем форму заявки.
// Она есть на главной странице (в модальном окне) и на странице order.html.
const orderForm = document.getElementById('order-form');

// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

if (orderForm) {
  // Обрабатываем отправку формы.
  orderForm.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку формы,
    // потому что backend пока не подключён.
    event.preventDefault();

    // Прячем сообщение об успехе от предыдущей отправки.
    successMessage.hidden = true;

    // Сбрасываем предыдущие признаки ошибок.
    const formElements = Array.from(orderForm.elements);

    formElements.forEach((element) => {
      if (element.willValidate) {
        element.removeAttribute('aria-invalid');
      }
    });

    // Проверяем встроенные HTML-ограничения формы.
    if (!orderForm.checkValidity()) {
      formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
          element.setAttribute('aria-invalid', 'true');
        }
      });

      // Показываем стандартные сообщения браузера.
      orderForm.reportValidity();
      return;
    }

    // Показываем сообщение об успешной отправке.
    successMessage.hidden = false;

    // Очищаем форму.
    orderForm.reset();

    // Закрываем модальное окно, если форма находится в нём.
    if (orderDialog) {
      orderDialog.close();
    }

    // Прокручиваем страницу так, чтобы сообщение оказалось в центре экрана.
    successMessage.scrollIntoView({ block: 'center' });
  });
}
