import React, { forwardRef, memo } from 'react'
import PropTypes from 'prop-types'
import {
    View,
    Image,
    NativeModules,
    requireNativeComponent,
    ViewPropTypes,
    StyleSheet,
} from 'react-native'

const FastImageViewNativeModule = NativeModules.FastImageView

class FastImageBase extends React.Component
{
    componentDidUpdate(prevProps, prevState) {
        if (this.props.source.uri === prevProps.source.uri) {
            return
        }

        this.setState({
            loaded: false,
            error: null,
        })
    }

    state = {
        loaded: false,
        error: null,
    }

    render ()
    {
        const {
            source,
            onLoadStart,
            onProgress,
            onLoad,
            onError,
            onLoadEnd,
            style,
            children,
            fallback,
            placeholder,
            ...props
        } = this.props;

        const { loaded, error } = this.state;

        const resolvedSource = Image.resolveAssetSource(source)

        if (fallback)
        {
            return (
                <View
                    style={[styles.imageContainer, style]}
                    ref={this.captureRef}
                >
                    {(!loaded || error) && placeholder}
                    <FastImageView
                        {...props}
                        style={StyleSheet.absoluteFill}
                        source={resolvedSource}
                        onLoadStart={onLoadStart}
                        onProgress={onProgress}
                        onLoad={onLoad}
                        onError={onError}
                        onLoadEnd={onLoadEnd}
                    />
                    {children}
                </View>
            )
        }

        return (
            <View style={[styles.imageContainer, style]} ref={this.captureRef}>
                {(!loaded || error) && placeholder}
                <FastImageView
                    {...props}
                    style={StyleSheet.absoluteFill}
                    source={resolvedSource}
                    onFastImageLoadStart={onLoadStart}
                    onFastImageProgress={onProgress}
                    onFastImageLoad={onLoad}
                    onFastImageError={data =>
                    {
                        this.setState({
                            error: true,
                        })
                        if(onError)
                        {
                            onError(data)
                        }
                    }}
                    onFastImageLoadEnd={data =>
                    {
                        this.setState({
                            loaded: true,
                        })
                        if(onLoadEnd)
                        {
                            onLoadEnd(data)
                        }
                    }}
                />
                {children}
            </View>
        )
    }
}

const FastImageMemo = memo(FastImageBase)

const FastImage = forwardRef((props, ref) => (
    <FastImageMemo forwardedRef={ref} {...props} />
))

FastImage.displayName = 'FastImage'

const styles = StyleSheet.create({
    imageContainer: {
        overflow: 'hidden',
    },
})

FastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
}

FastImage.priority = {
    // lower than usual.
    low: 'low',
    // normal, the default.
    normal: 'normal',
    // higher than usual.
    high: 'high',
}

FastImage.cacheControl = {
    // Ignore headers, use uri as cache key, fetch only if not in cache.
    immutable: 'immutable',
    // Respect http headers, no aggressive caching.
    web: 'web',
    // Only load from cache.
    cacheOnly: 'cacheOnly',
}

FastImage.preload = sources => {
    FastImageViewNativeModule.preload(sources)
}

FastImage.defaultProps = {
    resizeMode: FastImage.resizeMode.cover,
}

const FastImageSourcePropType = PropTypes.shape({
    uri: PropTypes.string,
    headers: PropTypes.objectOf(PropTypes.string),
    priority: PropTypes.oneOf(Object.keys(FastImage.priority)),
    cache: PropTypes.oneOf(Object.keys(FastImage.cacheControl)),
})

FastImage.propTypes = {
    ...ViewPropTypes,
    source: PropTypes.oneOfType([FastImageSourcePropType, PropTypes.number]),
    tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onLoadStart: PropTypes.func,
    onProgress: PropTypes.func,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    onLoadEnd: PropTypes.func,
    fallback: PropTypes.bool,
}

const FastImageView = requireNativeComponent('FastImageView', FastImage, {
    nativeOnly: {
        onFastImageLoadStart: true,
        onFastImageProgress: true,
        onFastImageLoad: true,
        onFastImageError: true,
        onFastImageLoadEnd: true,
    },
})

export default FastImage
