import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import {
  fillColors,
  fillStyles,
  strokeColors,
  strokeStyles,
  strokeWidth,
} from "../components/sideToolbar/helper";

const optionsAtom = atom<OptionsType>({
  key: "options",
  default: {
    strokeColor: strokeColors[4],
    strokeWidth: strokeWidth[0].type,
    roughness: 0,
    fillColor: fillColors[4],
    fillStyle: fillStyles[2].type,
    strokeStyle: strokeStyles[0].type,
  },
});

export const useOptions = () => {
  const options = useRecoilValue(optionsAtom);
  return options;
};

export const useSetOptions = () => {
  const setOptions = useSetRecoilState(optionsAtom);
  return setOptions;
};
