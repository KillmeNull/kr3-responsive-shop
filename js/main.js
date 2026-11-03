// На мобильном экране меню открывается кнопкой, без JavaScript ссылки видны сразу.
const menuToggle = document.querySelector('.site-header__menu-toggle');
const siteNavigation = document.querySelector('.site-nav');

if (menuToggle && siteNavigation) {
  const mobileNavigation = window.matchMedia('(max-width: 767px)');
  let menuExpanded = false;

  const updateNavigation = () => {
    menuToggle.hidden = !mobileNavigation.matches;
    menuToggle.setAttribute('aria-expanded', String(menuExpanded));
    siteNavigation.hidden = mobileNavigation.matches && !menuExpanded;
  };

  menuToggle.addEventListener('click', () => {
    menuExpanded = !menuExpanded;
    updateNavigation();
  });

  siteNavigation.addEventListener('click', (event) => {
    if (event.target.closest('a') && mobileNavigation.matches) {
      menuExpanded = false;
      updateNavigation();
      // Якорь ведёт в содержимое; скрытая ссылка меню не должна удерживать фокус.
      const link = event.target.closest('a');
      const destination = new URL(link.href);
      if (destination.pathname === location.pathname && destination.hash) {
        const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNavigation.matches && menuExpanded) {
      menuExpanded = false;
      updateNavigation();
      menuToggle.focus();
    }
  });

  mobileNavigation.addEventListener('change', () => {
    const focusedElement = document.activeElement;
    menuExpanded = false;
    updateNavigation();
    if (mobileNavigation.matches && siteNavigation.contains(focusedElement)) {
      menuToggle.focus();
    } else if (!mobileNavigation.matches && focusedElement === menuToggle) {
      siteNavigation.querySelector('a').focus();
    }
  });

  updateNavigation();
}

// Получаем модальное окно по id.
// На страницах без модального окна (например, order.html) здесь будет null.
const orderDialog = document.getElementById('order-dialog');

// Получаем все кнопки заказа в карточках товаров.
const orderButtons = document.querySelectorAll('.product-card__button');

// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');

// Получаем скрытое поле, в которое будет записан выбранный товар.
const selectedProductInput = document.getElementById('selected-product');
const selectedProductDescription = document.getElementById('order-dialog-product');

// Модальное окно есть только на главной странице,
// поэтому его обработчики подключаем, только если оно найдено.
if (orderDialog) {
  // Явно замыкаем Tab на границах диалога: некоторые браузеры после последнего
  // поля переводят фокус в свою панель, хотя фон страницы остаётся inert.
  orderDialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(orderDialog.querySelectorAll(
      'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]'
    )).filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Получаем название товара из data-атрибута.
      const productName = button.dataset.product;

      // Записываем название товара в скрытое поле формы.
      selectedProductInput.value = productName;
      selectedProductDescription.textContent = `Выбранный товар: ${productName}.`;

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
  // Без JavaScript остаётся встроенная HTML-валидация.
  orderForm.noValidate = true;
  const formSummary = document.getElementById('order-form-summary');
  const fields = Array.from(orderForm.elements).filter(element => element.willValidate);

  const getErrorMessage = (field) => {
    const validity = field.validity;
    if (validity.valueMissing) {
      const messages = {
        name: 'Введите имя (не менее двух символов).',
        email: 'Введите e-mail.',
        phone: 'Введите телефон в формате +7 (900) 000-00-00.',
        topic: 'Выберите тему заявки.',
        agreement: 'Для отправки заявки подтвердите согласие на обработку данных.'
      };
      return messages[field.name] || 'Заполните это поле.';
    }
    if (validity.typeMismatch && field.type === 'email') return 'Введите корректный e-mail, например ivan@example.com.';
    if (validity.tooShort) return `Введите не менее ${field.minLength} символов.`;
    if (validity.patternMismatch && field.type === 'tel') return 'Введите телефон в формате +7 (900) 000-00-00.';
    if (validity.badInput && field.type === 'date') return 'Введите полную корректную дату или оставьте поле пустым.';
    return field.validationMessage;
  };

  const updateFieldError = (field) => {
    const invalid = !field.validity.valid;
    const error = document.getElementById(`${field.id}-error`);
    if (invalid) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    if (error) {
      error.textContent = invalid ? getErrorMessage(field) : '';
      error.hidden = !invalid;
    }
    return invalid;
  };

  const updateSummary = () => {
    const count = fields.filter(field => field.getAttribute('aria-invalid') === 'true').length;
    const text = count ? `Проверьте поля с ошибками: ${count}. Подробности указаны рядом с полями.` : '';
    if (formSummary.textContent !== text) formSummary.textContent = text;
    formSummary.hidden = count === 0;
  };

  fields.forEach(field => {
    const onEdit = () => {
      successMessage.hidden = true;
      if (field.hasAttribute('aria-invalid')) {
        updateFieldError(field);
        updateSummary();
      }
    };
    field.addEventListener('input', onEdit);
    field.addEventListener('change', onEdit);
  });

  orderForm.addEventListener('reset', () => {
    fields.forEach(field => {
      field.removeAttribute('aria-invalid');
      const error = document.getElementById(`${field.id}-error`);
      if (error) { error.hidden = true; error.textContent = ''; }
    });
    updateSummary();
  });

  // Обрабатываем отправку формы.
  orderForm.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку формы,
    // потому что backend пока не подключён.
    event.preventDefault();

    // Прячем сообщение об успехе от предыдущей отправки.
    successMessage.hidden = true;

    // Используем HTML-ограничения, а ошибки показываем постоянным текстом.
    const invalidFields = fields.filter(updateFieldError);
    updateSummary();
    if (invalidFields.length) {
      invalidFields[0].focus();
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

    // Фокус сообщает результат и не остаётся на очищенной форме.
    successMessage.focus({ preventScroll: true });
    successMessage.scrollIntoView({ block: 'center' });
  });
}
