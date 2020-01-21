/**
 * Created by andrewhurst on 10/5/15.
 */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Keyboard,
  LayoutAnimation,
  View,
  Dimensions,
  ViewPropTypes,
  Platform,
  StyleSheet
} from "react-native";

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0
  }
});

// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation = {
  duration: 500,
  create: {
    duration: 300,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 200
  }
};

export default function KeyboardSpacer(props) {
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const [isKeyboardOpened, setKeyboardOpened] = useState(false);

  useEffect(() => {
    const updateListener =
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow";
    const resetListener =
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";

    const updateKeyboardSpace = event => {
      if (!event.endCoordinates) {
        return;
      }

      let animationConfig = defaultAnimation;
      if (Platform.OS === "ios") {
        animationConfig = LayoutAnimation.create(
          event.duration,
          LayoutAnimation.Types[event.easing],
          LayoutAnimation.Properties.opacity
        );
      }
      LayoutAnimation.configureNext(animationConfig);

      // get updated on rotation
      const screenHeight = Dimensions.get("window").height;
      // when external physical keyboard is connected
      // event.endCoordinates.height still equals virtual keyboard height
      // however only the keyboard toolbar is showing if there should be one
      const keyboardSpace =
        screenHeight - event.endCoordinates.screenY + props.topSpacing;
      setKeyboardSpace(keyboardSpace);
      setKeyboardOpened(true);
      props.onToggle(true, keyboardSpace);
    };

    const resetKeyboardSpace = event => {
      let animationConfig = defaultAnimation;
      if (Platform.OS === "ios") {
        animationConfig = LayoutAnimation.create(
          event.duration,
          LayoutAnimation.Types[event.easing],
          LayoutAnimation.Properties.opacity
        );
      }
      LayoutAnimation.configureNext(animationConfig);
      setKeyboardSpace(0);
      setKeyboardOpened(false);
      props.onToggle(false, 0);
    };

    Keyboard.addListener(updateListener, updateKeyboardSpace);
    Keyboard.addListener(resetListener, resetKeyboardSpace);

    return () => {
      Keyboard.removeListener(updateListener, updateKeyboardSpace);
      Keyboard.removeListener(resetListener, resetKeyboardSpace);
    };
  }, [props.topSpacing]);

  return (
    <View style={[styles.container, { height: keyboardSpace }, props.style]} />
  );
}

KeyboardSpacer.propTypes = {
  topSpacing: PropTypes.number,
  onToggle: PropTypes.func,
  style: ViewPropTypes.style
};

KeyboardSpacer.defaultProps = {
  topSpacing: 0,
  onToggle: () => null
};
