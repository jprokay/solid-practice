import { SetStoreFunction, createStore } from "solid-js/store";

export type ValidatorFn = (
  ele: HTMLObjectElement,
) => Promise<string | undefined>;

type Props = {
  element: HTMLObjectElement;
  validators: Array<ValidatorFn>;
  errorClass: string | undefined;
};

type Error = {
  [key: string]: string | undefined;
};

function checkValid(
  { element, validators, errorClass }: Props,
  setErrors: SetStoreFunction<Error>,
) {
  return async () => {
    element.setCustomValidity("");
    element.checkValidity();

    let message = element.validationMessage;

    if (!element.validity.valid) {
      for (const validator of validators) {
        const text = await validator(element);

        if (text) {
          element.setCustomValidity(text);
          break;
        }
      }
      message = element.validationMessage;
    }

    if (message !== "") {
      errorClass && element.classList.toggle(errorClass, true);
      setErrors({ [element.name]: message });
    }
  };
}

type Field = {
  [key: string]: {
    element: HTMLObjectElement;
    validators: Array<ValidatorFn>;
  };
};

export function useForm({ errorClass }: { errorClass: string | undefined }) {
  const [errors, setErrors] = createStore<Error>({});
  let fields: Field = {};

  const validate = (ref: HTMLObjectElement, accessor: () => any) => {
    const accessorValue = accessor();
    const validators = Array.isArray(accessorValue) ? accessorValue : [];

    fields[ref.name] = { element: ref, validators };
    ref.onblur = checkValid(
      { element: ref, validators, errorClass },
      setErrors,
    );
    ref.oninput = () => {
      if (!errors[ref.name]) {
        return;
      }
      setErrors({ [ref.name]: undefined });
      errorClass && ref.classList.toggle(errorClass, false);
    };
  };

  const formSubmit = (ref: HTMLObjectElement, accessor: () => any) => {
    const callback = accessor() || (() => {});
    ref.setAttribute("novalidate", "");
    ref.onsubmit = async (e) => {
      e.preventDefault();
      let errored = false;

      for (const k in fields) {
        const field = fields[k];
        await checkValid({ ...field, errorClass }, setErrors)();

        if (!errored && !field.element.validity.valid) {
          field.element.focus();
          errored = true;
        }
      }
      !errored && callback(ref);
    };
  };

  return { validate, formSubmit, errors };
}
