import * as eva from "@ui-kitten/eva";

const customMapping = {
  ...eva.mapping,
  components: {
    ...eva.mapping.components,

    Avatar: {
      ...eva.mapping.components.Avatar,
      appearances: {
        ...eva.mapping.components.Avatar.appearances,
        default: {
          ...eva.mapping.components.Avatar.appearances.default,
          variantGroups: {
            ...eva.mapping.components.Avatar.appearances.default.variantGroups,
            status: {
              ...eva.mapping.components.Avatar.appearances.default.variantGroups
                .status,
              primary: {
                ...eva.mapping.components.Avatar.appearances.default
                  .variantGroups.status.primary,
                textColor: "#FFFFFF",
              },
            },
          },
        },
      },
    },
  },
};

export default customMapping;
