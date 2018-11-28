import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

function ContainedButton(props) {
  const { classes, color, text, onClick } = props;
  return (
      <Button onClick={onClick} variant="contained" color={color} className={classes.button} style={{marginTop: '0px'}}>
        {text}
      </Button>
  )
}

ContainedButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ContainedButton);