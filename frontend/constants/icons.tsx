import { Icon, type IconProps } from "@ui-kitten/components";
import { Color } from "./theme";

type CustomIconProps = IconProps & {
  selected?: boolean;
  visible?: boolean;
};

// Icono del Logo
export const LogoIcon = (props: IconProps) => (
  <Icon {...props} name="bookmark" />
);

// Iconos de Sesión
export const MailIcon = (props: IconProps) => (
  <Icon {...props} name="email-outline" />
);

export const LockIcon = (props: IconProps) => (
  <Icon {...props} name="lock-outline" />
);

export const EyeIcon = ({ visible, ...props }: CustomIconProps) => (
  <Icon {...props} name={visible ? "eye-off-outline" : "eye-outline"} />
);

export const PersonIcon = (props: IconProps) => (
  <Icon {...props} name="person-outline" />
);

// Iconos de Tabs
export const HomeIcon = ({ selected, ...props }: CustomIconProps) => (
  <Icon {...props} name={selected ? "home" : "home-outline"} />
);

export const PlannerIcon = ({ selected, ...props }: CustomIconProps) => (
  <Icon {...props} name={selected ? "bookmark" : "bookmark-outline"} />
);

export const CalendarIcon = ({ selected, ...props }: CustomIconProps) => (
  <Icon {...props} name={selected ? "calendar" : "calendar-outline"} />
);

export const SettingsIcon = ({ selected, ...props }: CustomIconProps) => (
  <Icon {...props} name={selected ? "settings" : "settings-outline"} />
);

// Iconos de Menú
export const AgendasIcon = ({ selected, ...props }: CustomIconProps) => (
  <Icon
    {...props}
    name={selected ? "book" : "book-outline"}
    fill={Color.primary}
    style={[
      props.style,
      {
        width: 30,
        height: 30,
      },
    ]}
  />
);

// Iconos de Agendas
export const AgendaStatusIcon = ({ selected, ...props }: CustomIconProps) => (
  <Icon
    {...props}
    name={selected ? "checkmark-circle-2" : "checkmark-circle-2-outline"}
  />
);

export const EditIcon = (props: IconProps) => (
  <Icon {...props} name="edit-outline" />
);

export const DeleteIcon = (props: IconProps) => (
  <Icon {...props} name="trash-2-outline" />
);

export const PlusIcon = (props: IconProps) => (
  <Icon {...props} name="plus-outline" />
);

export const BackIcon = (props: IconProps) => (
  <Icon {...props} name="arrow-back" />
);
