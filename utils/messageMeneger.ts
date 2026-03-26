import { ElMessage } from "element-plus";
export default (
  text: string,
  type: "error" | "info" | "success" | "warning" = "success",
  duration: number = 3000,
  isHtml: boolean = false
): void => {
  ElMessage({
    dangerouslyUseHTMLString: isHtml,
    duration: duration,
    message: text,
    showClose: true,
    type: type,
  });
};
