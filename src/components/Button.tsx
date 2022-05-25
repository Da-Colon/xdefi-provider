import cx from "classnames";

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  isLoading?: boolean;
}

export const PrimaryButton = ({ className, ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const BASE_STYLES = "bg-gray-100 text-gray-500 font-semibold";
  const HOVER_STATE = "hover:bg-gray-300";
  const DISABLED_STATE = "disabled:bg-gray-500 disabled:text-gray-50";

  return <Button className={cx(BASE_STYLES, HOVER_STATE, DISABLED_STATE, className)} {...rest} />;
};

const Button = ({ label, className, isLoading, disabled, ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  /****************************
   * Text and Loading Component
   ****************************/
  const Label = () => {
    // @todo update button loader component
    return (
      <div className="flex justify-center relative">
        <div
          className={cx({
            "animate-pulse absolute": isLoading,
            hidden: !isLoading,
          })}
        >
          * * *
        </div>
        <div
          className={cx({
            invisible: isLoading,
            visible: !isLoading,
          })}
        >
          {label}
        </div>
      </div>
    );
  };

  /****************************
   * Styles
   ****************************/

  const BASE_BUTTON_STYLES = "py-1 px-4 mx-2 font-mono rounded flex items-center justify-center";

  return (
    <button className={cx(BASE_BUTTON_STYLES, className)} {...rest} disabled={isLoading || disabled}>
      <Label />
    </button>
  );
};

export default Button;
