import validJson from "@/i18n/valid.json";

export default (_error, isMessage) => {
  const errorStatusCode = _error.status && _error.status;
  const errorData = _error && _error._data ? _error._data.data : undefined;
  let text = "";

  function flattenObject(obj) {
    let result = {};

    function recursiveFlatten(currentObj, currentKey) {
      for (let key in currentObj) {
        if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
          let value = currentObj[key];
          let newKey = currentKey ? `${currentKey}.${key}` : key;

          if (Array.isArray(value)) {
            if (value.length === 1) {
              if (typeof value[0] === "object" && !Array.isArray(value[0])) {
                recursiveFlatten(value[0], newKey);
              } else {
                result[newKey] = value[0];
              }
            } else {
              value.forEach((item, index) => {
                if (typeof item === "object" && !Array.isArray(item)) {
                  recursiveFlatten(item, `${newKey}[${index}]`);
                } else {
                  result[`${newKey}[${index}]`] = item;
                }
              });
            }
          } else if (typeof value === "object" && value !== null) {
            recursiveFlatten(value, newKey);
          } else {
            result[newKey] = value;
          }
        }
      }
    }

    recursiveFlatten(obj, "");

    return result;
  }
  const switchCheck = (value) => {
    switch (value) {
      case "The block field is required.":
        text = "Поле блок обязательно для заполнения.";
        break;
      case "The email has already been taken.":
        text = "Электронная почта уже занята.";
        break;
      case "The password field must be at least 6 characters.":
        text = "Поле пароля должно содержать не менее 6 символов.";
        break;
      case "The start row number field must be between 1 and 100.":
        text = "Поле номера начальной строки должно быть от 1 до 100.";
        break;
      default:
        text = value;
    }
  };

  if (typeof errorData === "object") {
    let result = flattenObject(errorData);

    Object.keys(result).forEach((key) => {
      let _value = result[key];
      const stringValue = typeof _value === "string" ? _value : String(_value);
      if (stringValue.includes("field is required")) {
        const mapped =
          typeof validJson[key] === "string"
            ? validJson[key]
            : validJson[key] && validJson[key].loc && validJson[key].loc.source
              ? validJson[key].loc.source
              : null;
        messageMeneger(mapped || stringValue, "error", 7000);
      } else {
        switchCheck(stringValue);
        messageMeneger(text, "error", 7000);
      }
    });
  }
  if (typeof errorData === "string" && errorStatusCode !== 401) {
    messageMeneger(errorData, "error");
  }

  if (errorStatusCode === 401) {
    if (isMessage !== "noNavigate") {
      messageMeneger("Логин или пароль был введен неверно", "error", 4000);
      navigateTo("/auth");
    }
  } else if (errorStatusCode === 500) {
    ElMessage.error("! Tizimda no'sozlik status 500");
  } else if (errorStatusCode === 404) {
    ElMessage.error("Natija topilmadi");
  } else if (errorStatusCode === 400) {
    ElMessage.error("Ma'lumot to'g'ri emas emas");
    return "BLOKED";
  } else if (errorStatusCode === 409) {
    ElMessage.error(text);
    if (isMessage && isMessage !== "isNavigate") {
      navigateTo("/auth");
    }
    return "BLOKED";
  } else if (errorStatusCode === 403) {
    if (isMessage) {
      ElMessage.error(text);
    } else {
      ElMessage.error("Sizning xuquqlaringiz yetarli emas");
    }
    // navigateTo("/auth");
    return "BLOKED";
  } else {
    ElMessage.error(text);
  }
};
